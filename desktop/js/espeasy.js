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

$("#bt_addespeasyInfo").on('click', function(event) {
    var _cmd = {type: 'info'};
    addCmdToTable(_cmd);
});

$("#bt_addespeasyAction").on('click', function(event) {
    var _cmd = {type: 'action'};
    addCmdToTable(_cmd);
});

$('#bt_healthespeasy').on('click', function () {
    $('#md_modal').dialog({title: "{{Santé espeasy}}"});
    $('#md_modal').load('index.php?v=d&plugin=espeasy&modal=health').dialog('open');
});

$('.changeIncludeState').on('click', function () {
    var el = $(this);
    jeedom.config.save({
        plugin : 'espeasy',
        configuration: {include_mode: el.attr('data-state')},
        error: function (error) {
          $('#div_alert').showAlert({message: error.message, level: 'danger'});
      },
      success: function () {
        if (el.attr('data-state') == 1) {
            $.hideAlert();
            $('.changeIncludeState:not(.card)').removeClass('btn-default').addClass('btn-success');
            $('.changeIncludeState').attr('data-state', 0);
            $('.changeIncludeState.card').css('background-color','#8000FF');
            $('.changeIncludeState.card span center').text('{{Arrêter l\'inclusion}}');
            $('.changeIncludeState:not(.card)').html('<i class="fa fa-sign-in fa-rotate-90"></i> {{Arreter inclusion}}');
            $('#div_inclusionAlert').showAlert({message: '{{Vous etes en mode inclusion. Recliquez sur le bouton d\'inclusion pour sortir de ce mode}}', level: 'warning'});
        } else {
            $.hideAlert();
            $('.changeIncludeState:not(.card)').addClass('btn-default').removeClass('btn-success btn-danger');
            $('.changeIncludeState').attr('data-state', 1);
            $('.changeIncludeState:not(.card)').html('<i class="fa fa-sign-in fa-rotate-90"></i> {{Mode inclusion}}');
            $('.changeIncludeState.card span center').text('{{Mode inclusion}}');
            $('.changeIncludeState.card').css('background-color','#ffffff');
            $('#div_inclusionAlert').hideAlert();
        }
    }
});
});

$('body').on('espeasy::includeDevice', function (_event,_options) {
    if (modifyWithoutSave) {
        $('#div_inclusionAlert').showAlert({message: '{{Un périphérique vient d\'être inclu/exclu. Veuillez réactualiser la page}}', level: 'warning'});
    } else {
        if (_options == '') {
            window.location.reload();
        } else {
            window.location.href = 'index.php?v=d&p=espeasy&m=espeasy&id=' + _options;
        }
    }
});

function sortDico(obj) {
    var arr = [];
    $.each(obj, function(index, item) {
        arr.push({id: index, item: item});
    });
    arr.sort(function(a, b) {
        return a.item < b.item ? -1 : a.item > b.item ? 1 : 0;
    });
    var select = '';
    arr.forEach(function(item) {
        select += '<option value="' + item.id + '">' + item.item + '</option>';
    });
    return select;
}
var dicos = {
    C: sortDico(mySensorDico.C),
    N: sortDico(mySensorDico.N),
    S: sortDico(mySensorDico.S)
};

$("#table_cmd").delegate(".listEquipementInfo", 'click', function () {
    var el = $(this);
    jeedom.cmd.getSelectModal({cmd: {type: 'info'}}, function (result) {
        var calcul = el.closest('tr').find('.cmdAttr[data-l1key=configuration][data-l2key=' + el.data('input') + ']');
        calcul.atCaret('insert', result.human);
    });
});

$("#table_cmd").delegate(".listEquipementAction", 'click', function () {
    var el = $(this);
    var subtype = $(this).closest('.cmd').find('.cmdAttr[data-l1key=subType]').value();
    jeedom.cmd.getSelectModal({cmd: {type: 'action', subType: subtype}}, function (result) {
        var calcul = el.closest('tr').find('.cmdAttr[data-l1key=configuration][data-l2key=' + el.attr('data-input') + ']');
        calcul.atCaret('insert', result.human);
    });
});

$("#table_cmd").sortable({axis: "y", cursor: "move", items: ".cmd", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true});

function addCmdToTable(_cmd) {
    if (!isset(_cmd)) {
        var _cmd = {configuration: {}};
    }
    if (!isset(_cmd.configuration)) {
        _cmd.configuration = {};
    }

    if (init(_cmd.type) == 'info') {
        var disabled = (init(_cmd.configuration.virtualAction) == '1') ? 'disabled' : '';
        var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">';
        tr += '<td>';
			tr += '<span class="cmdAttr" data-l1key="id"></span>';
        tr += '</td>';
        tr += '<td>';
			tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" style="width : 140px;" placeholder="{{Nom du capteur}}"></td>';
        tr += '<td>';
			tr += '<input class="cmdAttr form-control type input-sm" data-l1key="type" value="info" disabled style="margin-bottom : 5px;" />';
			tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>';
        tr += '</td>';
        tr += '<td>';	tr += '<span  style="width : 30%;display : inline-block;">{{Numéro}} :</span><span  style="width : 60%;display : inline-block;">{{Type}} :</span>';
			tr += '<textarea class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="sensor" style="height : 33px; width : 30%;display : inline-block;" ' + disabled + ' placeholder="{{Capteur}}"></textarea>';
			//tr += '<textarea class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="sensorCategory" style="height : 33px; width : 40%;display : inline-block;" ' + disabled + ' placeholder="{{Type de Capteur}}" readonly=true></textarea>';
			tr += '<select class="cmdAttr" data-l1key="configuration" data-l2key="sensorCategory" style="height : 33px; width : 60%;display : inline-block;">';
			tr += '<option value="90">Aucun</option>';
			tr += dicos.S;
			tr +='</select>';
	tr += '<span style="width : 40%;display : inline-block;">{{Valeur}} :</span>';
	if (isset(_cmd.configuration.sensorCategory) && _cmd.configuration.sensorCategory == "23") {
		tr += '<textarea class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="value"  style="height : 33px;width : 100%;display : inline-block;" ' + disabled + ' placeholder="{{Valeur}}"></textarea></br>';
		tr += '<a class="btn btn-default cursor listEquipementInfo btn-sm" data-input="value"><i class="fa fa-list-alt "></i> {{Rechercher Ã©quipement}}</a><br/>';
	} else {
		tr += '<textarea class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="value" style="height : 33px;" ' + disabled + ' placeholder="{{Valeur}}" readonly=true></textarea>';
	}
        tr += '</td>';
        tr += '<td>{{Unité}} :<br/>';
        tr += '<input class="cmdAttr form-control input-sm" data-l1key="unite" style="width : 90px;" placeholder="{{Unite}}">';
		tr += '<span>{{Type}}:<select class="cmdAttr" data-l1key="configuration" data-l2key="sensorType" >';
		tr += '<option value="90">Aucun</option>';
		tr += dicos.N;
		tr +='</select></span>';
        tr += '</td><td>';
        tr += '<span><input type="checkbox" data-size="mini" data-label-text="{{Historiser}}" class="cmdAttr bootstrapSwitch" data-l1key="isHistorized" /></span>';
        tr += '<span><input type="checkbox" data-size="mini" data-label-text="{{Afficher}}" class="cmdAttr bootstrapSwitch" data-l1key="isVisible" /></span>';
        tr += '<span class="expertModeVisible"><input type="checkbox" data-size="mini" data-label-text="{{Inverser}}" class="cmdAttr bootstrapSwitch" data-l1key="display" data-l2key="invertBinary" /></span>';
        tr += '<input class="tooltips cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="minValue" placeholder="{{Min}}" title="{{Min}}" style="width : 40%;display : inline-block;"> ';
        tr += '<input class="tooltips cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="maxValue" placeholder="{{Max}}" title="{{Max}}" style="width : 40%;display : inline-block;">';
        tr += '</td>';
        tr += '<td>';
        if (is_numeric(_cmd.id)) {
            tr += '<a class="btn btn-default btn-xs cmdAction expertModeVisible" data-action="configure"><i class="fa fa-cogs"></i></a> ';
            tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fa fa-rss"></i> {{Tester}}</a>';
        }
        tr += '<i class="fa fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i></td>';
        tr += '</tr>';
        $('#table_cmd tbody').append(tr);
        $('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
        /*if (isset(_cmd.type)) {
            $('#table_cmd tbody tr:last .cmdAttr[data-l1key=type]').value(init(_cmd.type));
        }
        jeedom.cmd.changeType($('#table_cmd tbody tr:last'), init(_cmd.subType));*/
    }

    if (init(_cmd.type) == 'action') {
        var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">';
        tr += '<td>';
        tr += '<span class="cmdAttr" data-l1key="id"></span>';
        tr += '</td>';
        tr += '<td>';
        tr += '<div class="row">';
        tr += '<div class="col-lg-6">';
        tr += '<a class="cmdAction btn btn-default btn-sm" data-l1key="chooseIcon"><i class="fa fa-flag"></i> Icone</a>';
        tr += '<span class="cmdAttr" data-l1key="display" data-l2key="icon" style="margin-left : 10px;"></span>';
        tr += '</div>';
        tr += '<div class="col-lg-6">';
        tr += '<input class="cmdAttr form-control input-sm" data-l1key="name">';
        tr += '</div>';
        tr += '</div>';
        tr += '<select class="cmdAttr form-control tooltips input-sm" data-l1key="value" style="display : none;margin-top : 5px;" title="{{La valeur de la commande vaut par dÃ©faut la commande}}">';
	tr += '<option value="">Aucune</option>';
	tr += '</select>';
        tr += '</td>';
        tr += '<td>';
        tr += '<input class="cmdAttr form-control type input-sm" data-l1key="type" value="action" disabled style="margin-bottom : 5px;" />';
		tr += '<span>{{Message}}:<select class="cmdAttr" data-l1key="configuration" data-l2key="cmdCommande">';
		tr += dicos.C;
		tr +='</select></span>';
        tr += '<span class="subType" subType="' + init(_cmd.subType) + '" style=""></span>';
        //tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="virtualAction" value="1" style="display:none;" >';
        tr += '</td>';
         tr += '<td>';
			tr += '<textarea class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="sensor" style="height : 33px;" ' + disabled + ' placeholder="{{NÂ° Actionneur}}"></textarea><br/>';
        tr += 'Valeur de la commande :<br/>';
			tr += '<textarea class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="request" style="height : 33px;" ' + disabled + ' placeholder="{{Valeur}}"></textarea>';
        tr += '</td><td>';
	tr += '<span>{{Type}} :<select class="cmdAttr" data-l1key="configuration" data-l2key="cmdtype">';
		tr += dicos.N;
		tr +='</select></span>';
        tr += '</td><td>';
        tr += '<span><input type="checkbox" data-size="mini" data-label-text="{{Afficher}}" class="cmdAttr bootstrapSwitch" data-l1key="isVisible" /></span>';
        tr += '<input class="tooltips cmdAttr form-control input-sm expertModeVisible" data-l1key="configuration" data-l2key="minValue" placeholder="{{Min}}" title="{{Min}}" style="margin-top : 5px;"> ';
    tr += '<input class="tooltips cmdAttr form-control input-sm expertModeVisible" data-l1key="configuration" data-l2key="maxValue" placeholder="{{Max}}" title="{{Max}}" style="margin-top : 5px;">';
        tr += '</td>';
        tr += '<td>';
        if (is_numeric(_cmd.id)) {
            tr += '<a class="btn btn-default btn-xs cmdAction expertModeVisible" data-action="configure"><i class="fa fa-cogs"></i></a> ';
            tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fa fa-rss"></i> {{Tester}}</a>';
        }
        tr += '<i class="fa fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i></td>';
        tr += '</tr>';

        $('#table_cmd tbody').append(tr);
        //$('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
        var tr = $('#table_cmd tbody tr:last');
 	jeedom.eqLogic.builSelectCmd({
	id: $(".li_eqLogic.active").attr('data-eqLogic_id'),
	filter: {type: 'info'},
	error: function (error) {
		$('#div_alert').showAlert({message: error.message, level: 'danger'});
	},
	success: function (result) {
		tr.find('.cmdAttr[data-l1key=value]').append(result);
		tr.setValues(_cmd, '.cmdAttr');
		jeedom.cmd.changeType(tr, init(_cmd.subType));
	}
	});

    }
}
