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

require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');
if (!isConnect()) {
  include_file('desktop', '404', 'php');
  die();
}
?>


<form class="form-horizontal">
  <div class="form-group">
    <fieldset>

      <div id="div_local" class="form-group">
        <label class="col-lg-4 control-label">{{Gateway série maître}} :</label>
        <div class="col-lg-4">
          <select id="select_port" style="margin-top:5px" class="configKey form-control" data-l1key="nodeGateway">
            <option value="none">{{Aucune}}</option>
            <?php
            foreach (jeedom::getUsbMapping('', true) as $name => $value) {
              echo '<option value="' . $name . '">' . $name . ' (' . $value . ')</option>';
            }
            ?>
          </select>

          <input id="manual_port" class="configKey form-control" data-l1key="nodeAdress" style="margin-top:5px;display:none" placeholder="ex: 192.168.1.1:5003"/>
        </div>
      </div>

      <div id="div_local" class="form-group">
        <label class="col-lg-4 control-label">{{Gateway réseau}} :</label>
        <div class="col-lg-4 div_network">
          <a class="btn btn-default bt_network"><i class="fa fa-plus-circle"></i>
            Ajouter un mySensors réseau
          </a>
          <table id="table_net" class="table table-bordered table-condensed">
              <tbody>
                <?php

                if (config::byKey('netgate','mySensors') != '') {
                  $net = explode(";", config::byKey('netgate','mySensors'));
                  foreach ($net as $value) {
                    echo "<tr><td><input name='network' type='text' class='input_network' placeholder='ip:port' value='" . $value . "'></td><td><i class='fa fa-minus-circle cursor'></i></td></tr>";
                  }
                }

                 ?>
              </tbody>
          </table>

          </div>
        </div>

    </fieldset>
  </form>
  <?php
  if (config::byKey('jeeNetwork::mode') == 'master') {
    foreach (jeeNetwork::byPlugin('mySensors') as $jeeNetwork) {
      ?>
      <form class="form-horizontal slaveConfig" data-slave_id="<?php echo $jeeNetwork->getId(); ?>">
        <fieldset>
          <div class="form-group">
            <label class="col-lg-4 control-label">{{Gateway série esclave}} <?php echo $jeeNetwork->getName() ?></label>
            <div class="col-lg-4">
              <select class="slaveConfigKey form-control" data-l1key="nodeGateway">
                <option value="none">{{Aucune}}</option>
                <?php
                foreach ($jeeNetwork->sendRawRequest('jeedom::getUsbMapping', array('gpio' => true)) as $name => $value) {
                  echo '<option value="' . $name . '">' . $name . ' (' . $value . ')</option>';
                }
                ?>
              </select>
            </div>
          </div>

        </fieldset>
      </form>
      <?php
    }
  }
  ?>

  <script>

  $('.bt_network').on('click',function(){
    var newInput = $("<tr><td><input name='network' type='text' class='input_network' placeholder='ip:port'></td><td><i class='fa fa-minus-circle cursor'></i></td></tr>");
    $('#table_net tbody').append(newInput);
  });

  $('.cursor').on('click',function(){
    $(this).closest('tr').remove();
  });

  function mySensors_postSaveConfiguration(){
  var network = '';
  $('.input_network').each(function(index, value) {
    if (network != '' ) {
      network = network + ';' + $(this).value();
    } else {
      network = $(this).value();
    }
  });
  $.ajax({// fonction permettant de faire de l'ajax
      type: "POST", // methode de transmission des données au fichier php
      url: "plugins/mySensors/core/ajax/mySensors.ajax.php", // url du fichier php
      data: {
          action: "netgate",
          value: network,
      },
      dataType: 'json',
      error: function (request, status, error) {
          handleAjaxError(request, status, error);
      },
      success: function (data) { // si l'appel a bien fonctionné
  if (data.state != 'ok') {
    $('#div_alert').showAlert({message: data.result, level: 'danger'});
    return;
  }
  }
  });
  }
  </script>
</div>
</fieldset>
</form>
