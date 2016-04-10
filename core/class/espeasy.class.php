<?php

/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

/* * ***************************Includes********************************* */
require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';


class espeasy extends eqLogic {

  public static function sendCommand( $gateway, $destination, $sensor, $command, $acknowledge, $type, $payload ) {
    //default master
    $ip = '127.0.0.1';
    $port = '8019';

    $jeeNetwork = jeeNetwork::byName($gateway);
    if (is_object($jeeNetwork)) {
      $ip = $jeeNetwork->getIp();
    }
    if (config::byKey('netgate','espeasy') != '') {
      $net = explode(";", config::byKey('netgate','espeasy'));
      foreach ($net as $value) {
        $gate = explode(";", $value);
        if ($gateway == $gate[0]) {
          $ip = $gate[0];
          $port = $gate[1];
        }
      }
    }
    $msg = $destination . ";" . $sensor . ";" . $command . ";" . $acknowledge . ";" .$type . ";" . $payload;
    espeasy::sendToController($ip,$port,$msg);
  }

  public static function saveValue($gateway, $nodeid,$sensor,$type, $value) {
    $cmdId = 'Sensor'.$sensor;
    $elogic = self::byLogicalId($nodeid, 'espeasy');
    if (is_object($elogic)) {
      $elogic->setStatus('lastCommunication', date('Y-m-d H:i:s'));
      $elogic->save();
      $cmdlogic = espeasyCmd::byEqLogicIdAndLogicalId($elogic->getId(),$cmdId);
      if (is_object($cmdlogic)) {
        $cmdlogic->setConfiguration('value', $value);
        $cmdlogic->setConfiguration('sensorType', $type);
        $cmdlogic->save();
        $cmdlogic->event($value);
      }
    }
  }

  public static function saveSketchNameEvent($gateway, $nodeid, $value) {
    $elogic = self::byLogicalId($nodeid, 'espeasy');
    if (is_object($elogic)) {
      if ( $elogic->getConfiguration('SketchName', '') != $value ) {
        $elogic->setConfiguration('SketchName',$value);
        //si le sketch a changé sur le node, alors on set le nom avec le sketch
        $elogic->setName($value.' - '.$nodeid);
        $elogic->save();
      }
    }
    else {
      $mys = new espeasy();
      $mys->setEqType_name('espeasy');
      $mys->setLogicalId($nodeid);
      $mys->setConfiguration('nodeid', $nodeid);
      $mys->setConfiguration('gateway', $gateway);
      $mys->setConfiguration('SketchName',$value);
      $mys->setName($value.' - '.$nodeid);
      $mys->setIsEnable(true);
      $mys->save();
      event::add('espeasy::includeDevice',
      array(
        'state' => $state
      )
    );
  }
}


class espeasyCmd extends cmd {
  public function execute($_options = null) {
    switch ($this->getType()) {
      case 'info' :
      return $this->getConfiguration('value');
      break;
      case 'action' :
      $request = $this->getConfiguration('request');
      switch ($this->getSubType()) {
        case 'slider':
        $request = str_replace('#slider#', $_options['slider'], $request);
        break;
        case 'color':
        $request = str_replace('#color#', $_options['color'], $request);
        break;
        case 'message':
        if ($_options != null)  {
          $replace = array('#title#', '#message#');
          $replaceBy = array($_options['title'], $_options['message']);
          if ( $_options['title'] == '') {
            throw new Exception(__('Le sujet ne peuvent être vide', __FILE__));
          }
          $request = str_replace($replace, $replaceBy, $request);
        }
        else
        $request = 1;
        break;
        default : $request == null ?  1 : $request;
      }

      $eqLogic = $this->getEqLogic();

      espeasy::sendCommand(
      $eqLogic->getConfiguration('nodeid') ,
      $this->getConfiguration('sensor'),
      $this->getConfiguration('cmdCommande'),
      1,
      $this->getConfiguration('cmdtype'),
      $request );

      $result = $request;
      return $result;
    }
    return true;
  }
}
