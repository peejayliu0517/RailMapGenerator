'use strict';

function initLayoutPanel() {
    var layoutList = new mdc.list.MDCList($('#panel_layout .mdc-list')[0]);
    var layoutListItemRipple = layoutList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

    var svgWidthTextField = new mdc.textField.MDCTextField($('#svg_width')[0]);
    svgWidthTextField.value = getParams().svg_width;
    $('#svg_width > input').on('input', event => {
        myLine.svgWidth = event.target.value;
    });

    var branchSpacingSlider = new mdc.slider.MDCSlider($('#branch_spacing')[0]);
    branchSpacingSlider.value = getParams().branch_spacing;
    branchSpacingSlider.listen('MDCSlider:input', () => {
        myLine.branchSpacing = branchSpacingSlider.value;
    });

    var yPcSlider = new mdc.slider.MDCSlider($('#y_pc')[0]);
    yPcSlider.value = getParams().y_pc;
    yPcSlider.listen('MDCSlider:input', () => {
        myLine.yPc = yPcSlider.value;
    });
}

function initDesignPanel() {
    var themeCitySelect = new mdc.select.MDCSelect($('#theme_city')[0]);
    var themeLineSelect = new mdc.select.MDCSelect($('#theme_line')[0]);
    // var themeColourSelect = new mdc.textField.MDCTextField($('#theme_colour')[0]);
    $.getJSON('data/city_list.json', function(data) {
        data.forEach(function(c) {
            $('#theme_city > select').append(
                `<option value="${c.id}">${c.name[0]}</option>`
            );
        });

        var [themeCity, themeLine, themeColour] = getParams().theme
        var cityIdx = $(`#theme_city > select > [value="${themeCity}"]`).index();
        themeCitySelect.selectedIndex = cityIdx;
    });

    themeCitySelect.listen("MDCSelect:change", (event) => {
        $('#theme_line > select').empty();

        if (event.detail.value == 'nullcity') {
            //
        } else {
            $.getJSON(`data/${event.detail.value}.json`, data => {
                data.forEach(l => {
                    $('#theme_line > select').append(
                        `<option value="${l.id}" colour="${l.colour}">${l.name[0]}</option>`
                    );
                });

                var param_instance = getParams();
                var themeLine = param_instance.theme[1];
                var lineIdx = $(`#theme_line > select > [value="${themeLine}"]`).index();

                if (lineIdx == -1) {
                    themeLineSelect.selectedIndex = 0;
                } else {
                    themeLineSelect.selectedIndex = lineIdx;
                }

                param_instance.theme[0] = event.detail.value;
                putParams(param_instance);
            });
        }
    });

    themeLineSelect.listen("MDCSelect:change", event => {
        if (themeCitySelect.value == 'nullcity') {
            //
        } else {
            var param = getParams();
            param.theme[1] = event.detail.value;
            putParams(param);

            myLine.themeLine = event.detail.value;
            myLine.themeColour = $('#theme_line option').eq(event.detail.index).attr('colour');
        }
    });

    var directionLToggle = new mdc.iconButton.MDCIconButtonToggle($('#direction_l')[0]);
    var directionRToggle = new mdc.iconButton.MDCIconButtonToggle($('#direction_r')[0]);
    directionLToggle.unbounded = true;
    directionRToggle.unbounded = true;
    if (getParams().direction == 'l') {
        directionLToggle.on = true;
        directionRToggle.on = false;
        $('#direction_l').prop('disabled', true);
    } else {
        directionLToggle.on = false;
        directionRToggle.on = true;
        $('#direction_r').prop('disabled', true);
    }
    directionRToggle.listen('MDCIconButtonToggle:change', event => {
        if (event.detail.isOn) {
            myLine.direction = 'r';
            directionLToggle.on = false;
            $('#direction_r').prop('disabled', true);
            $('#direction_l').prop('disabled', false);
        }
    })
    directionLToggle.listen('MDCIconButtonToggle:change', event => {
        if (event.detail.isOn) {
            myLine.direction = 'l';
            directionRToggle.on = false;
            $('#direction_l').prop('disabled', true);
            $('#direction_r').prop('disabled', false);
        }
    })

    var platformTextField = new mdc.textField.MDCTextField($('#platform_num')[0]);
    platformTextField.value = getParams().platform_num;
    $('#platform_num > input').on('input', event => {
        myLine.platformNum = event.target.value;
    });

    var txtFilpButtonRipple = new mdc.ripple.MDCRipple($('#txt_flip')[0]);
    txtFilpButtonRipple.unbounded = true;
    $('#txt_flip').on('click', event => {myLine.swapStnName();});
}

function initStationsPanel() {
    var stationsList = new mdc.list.MDCList($('#panel_stations .mdc-list:first-child')[0]);
    var stationsListItemRipple = stationsList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));
    stationsList.listen('MDCList:action', event => {
        console.log(event.detail);
        // console.log(event.detail.index);
        switch (event.detail.index) {
            case 0:
                stnAddDialog.open();
                break;
            case 1:
                stnSelectDialog.open();
                break;
            case 2:
                var stnId = $('#panel_stations #selected_stn').attr('stn');
                if (stnId == 'none') {break;}
                myLine.currentStnId = stnId;
                break;
            case 3:
                var stnId = $('#panel_stations #selected_stn').attr('stn');
                if (stnId == 'none') {break;}
                stnModifyDialog.open();
                break;
            case 4:
                var stnId = $('#panel_stations #selected_stn').attr('stn');
                if (stnId == 'none') {break;}
                stnTransferDialog.open();
                break;
            case 5:
                var stnId = $('#panel_stations #selected_stn').attr('stn');
                if (stnId == 'none') {break;}
                stnDeleteConfirmDialog.open();
                break;
        }
    });


    // Selection
    var stnSelectDialog = new mdc.dialog.MDCDialog($('#stn_select_diag')[0]);
    var stnSelectDialogList = new mdc.list.MDCList($('#stn_select_diag .mdc-list')[0]);
    for (let [stnId, stnInfo] of Object.entries(getParams().stn_list)) {
        if (['linestart', 'lineend'].includes(stnId)) {continue;}
        $('#stn_select_diag ul').append(
            `<li class="mdc-list-item" data-mdc-dialog-action="${stnId}">
            <span class="mdc-list-item__text">${stnInfo.name.join(' - ')}</span>
            </li>`
        );
    }
    $('#stn_select_diag li:first-child').attr('tabindex', 0);
    stnSelectDialog.listen('MDCDialog:opening', event => {
        //
    });
    stnSelectDialog.listen('MDCDialog:opened', () => {
        stnSelectDialogList.layout();
        var stnSelectDialogListItemRipple = stnSelectDialogList.listElements.map(
            listItemEl => new mdc.ripple.MDCRipple(listItemEl)
        );
    });
    stnSelectDialog.listen('MDCDialog:closed', event => {
        if (event.detail.action == 'close') {return;}

        var selectedStnNames = $(`#stn_select_diag ul [data-mdc-dialog-action=${event.detail.action}] span`).html();
        $('#panel_stations #selected_stn span:nth-child(2)').html(
            `Modify Station: ${selectedStnNames}`
        );
        $('#panel_stations #selected_stn').attr('stn', event.detail.action);

        if (event.detail.action == 'none') {
            [4,5,6,7].forEach(i => $(`#panel_stations #stations_list li:nth-child(${i})`).addClass('mdc-list-item--disabled'));
        } else {
            [4,5,6,7].forEach(i => $(`#panel_stations #stations_list li:nth-child(${i})`).removeClass('mdc-list-item--disabled'));
        }
    });

    // var stationSelect = new mdc.select.MDCSelect($('#stn_list')[0]);
    for (let [stnId, stnInfo] of Object.entries(getParams().stn_list)) {
        if (['linestart', 'lineend'].includes(stnId)) {continue;}
        // $('#stn_list > select').append(
        //     `<option value="${stnId}">${stnInfo.name.join(' - ')}</option>`
        // );
        $('#stn_add_diag #pivot select').append(
            `<option value="${stnId}">${stnInfo.name.join(' - ')}</option>`
        );
    }
    // var stnCurrentToggle = new mdc.iconButton.MDCIconButtonToggle($('#stn_current')[0]);
    // stationSelect.listen('MDCSelect:change', event => {
    //     // stnCurrentToggle.on = (getParams().current_stn_idx == event.detail.value)
    // });
    // stationSelect.selectedIndex = 0;
    // stnCurrentToggle.listen('MDCIconButtonToggle:change', event => {
    //     if (!event.detail.isOn) {
    //         console.log(event.detail);
    //         stnCurrentToggle.on = true;
    //         return;
    //     }
    //     console.log(stationSelect.value);
    //     myLine.currentStnId = stationSelect.value;
    // })

    // Addition
    // var stnAddButtonRipple = new mdc.ripple.MDCRipple($('#stn_add')[0]);
    // stnAddButtonRipple.unbounded = true;
    var stnAddDialog = new mdc.dialog.MDCDialog($('#stn_add_diag')[0]);
    // $('#stn_add').on('click', event => stnAddDialog.open());

    var stnAddPrepSelect = new mdc.select.MDCSelect($('#stn_add_diag #prep')[0]);
    var stnAddPivotSelect = new mdc.select.MDCSelect($('#stn_add_diag #pivot')[0]);
    var stnAddLocSelect = new mdc.select.MDCSelect($('#stn_add_diag #loc')[0]);
    var stnAddEndSelect = new mdc.select.MDCSelect($('#stn_add_diag #end')[0]);
    stnAddDialog.listen('MDCDialog:opening', event => {
        $('#stn_add_diag #pivot')[0].dispatchEvent(new Event('MDCSelect:change'));
    });
    stnAddDialog.listen('MDCDialog:opened', event => {
        [stnAddPrepSelect, stnAddPivotSelect, stnAddLocSelect].forEach(select => select.layout());
    });
    stnAddDialog.listen('MDCDialog:closed', event => {
        if (event.detail.action == 'close') {return;}

        var prep = stnAddPrepSelect.value;
        var stnId = stnAddPivotSelect.value;
        var loc = stnAddLocSelect.value;
        var end = stnAddEndSelect.value;
        
        var [newId, newInfo] = myLine.addStn(prep, stnId, loc, end);

        $('#stn_list > select').append(
            `<option value="${newId}">${newInfo.name.join(' - ')}</option>`
        );
        $('#stn_select_diag ul').append(
            `<li class="mdc-list-item" data-mdc-dialog-action="${newId}">
            <span class="mdc-list-item__text">${newInfo.name.join(' - ')}</span>
            </li>`
        );
        $('#stn_add_diag #pivot select').append(
            `<option value="${newId}">${newInfo.name.join(' - ')}</option>`
        );

        // Trigger station name modification
        // stationSelect.value = newId;
        // $('#panel_stations #selected_stn').attr('stn', newId);
        // $('#panel_stations #selected_stn span:last-child').html(`Modify Station: ${newInfo.name.join(' - ')}`);
        // $('#stn_modify')[0].dispatchEvent(new Event('click'));
        $('#stn_select_diag')[0].dispatchEvent(new CustomEvent('MDCDialog:closed', {'detail':{'action':newId}}));
        $('#panel_stations #stations_list')[0].dispatchEvent(new CustomEvent('MDCList:action', {'detail':{'index':3}}));
    });
    stnAddPrepSelect.listen('MDCSelect:change', event => {
        $('#stn_add_diag #pivot')[0].dispatchEvent(new Event('MDCSelect:change'));
    });
    stnAddPivotSelect.listen('MDCSelect:change', event => {
        var prep = stnAddPrepSelect.value;
        var stnId = stnAddPivotSelect.value;
        var stnList = getParams().stn_list;
        for (let [idx, state] of myLine.newStnPossibleLoc(prep, stnId).entries()) {
            if (state) {
                $('#stn_add_diag #loc option').eq(idx).prop('disabled', false);
                if (idx >= 3) {
                    // newupper or newlower
                    $('#stn_add_diag #end select').empty();
                    state.forEach(stnId => {
                        $('#stn_add_diag #end select').append(
                            `<option value="${stnId}">${stnList[stnId].name.join(' - ')}</option>`
                        );
                    });
                }
            } else {
                $('#stn_add_diag #loc option').eq(idx).prop('disabled', true);
            }
            // $('#stn_add_diag #loc option').eq(idx).prop('disabled', (state)?false:true);
        }
        stnAddLocSelect.value = $('#stn_add_diag #loc option:not([disabled]):first').attr('value');
    });
    stnAddLocSelect.listen('MDCSelect:change', event => {
        if (['newupper', 'newlower'].includes(event.detail.value)) {
            $('#stn_add_diag #new_branch').attr('style', '');
            stnAddEndSelect.selectedIndex = 0;
        } else {
            $('#stn_add_diag #new_branch').attr('style', 'display:none');
        }
    });


    // Modification (Name)
    // var stnModifyButtonRipple = new mdc.ripple.MDCRipple($('#stn_modify')[0]);
    // stnModifyButtonRipple.unbounded = true;
    var stnModifyDialog = new mdc.dialog.MDCDialog($('#stn_modify_diag')[0]);
    var stnModifyNameZHField = new mdc.textField.MDCTextField($('#stn_modify_diag #name_zh')[0]);
    var stnModifyNameENField = new mdc.textField.MDCTextField($('#stn_modify_diag #name_en')[0]);
    // $('#stn_modify').on('click', event => {
    //     if (stationSelect.value == 'null') {return;}
    //     stnModifyDialog.open();
    // });
    stnModifyDialog.listen('MDCDialog:opening', event => {
        // var stnId = stationSelect.value;
        var stnId = $('#panel_stations #selected_stn').attr('stn');
        var param = getParams();
        [stnModifyNameZHField.value, stnModifyNameENField.value] = param.stn_list[stnId].name;
    });
    stnModifyDialog.listen('MDCDialog:opened', event => {
        stnModifyNameZHField.layout();
        stnModifyNameENField.layout();
    })
    $('#stn_modify_diag #name_zh, #name_en').on('input', event => {
        var nameZH = stnModifyNameZHField.value;
        var nameEN = stnModifyNameENField.value;
        var stnId = $('#panel_stations #selected_stn').attr('stn');
        myLine.updateStnName(stnId, nameZH, nameEN);
        $(`#stn_select_diag ul [data-mdc-dialog-action="${stnId}"] span`).html(`${nameZH} - ${nameEN}`);
        $('#panel_stations #selected_stn span:last-child').html(`Modify Station: ${nameZH} - ${nameEN}`);
        // $('#stn_list option').eq(stationSelect.selectedIndex).html(`${nameZH} - ${nameEN}`);
        $(`#stn_add_diag #pivot select [value=${stnId}]`).html(`${nameZH} - ${nameEN}`);
    });


    // Modification (Interchange)
    // var stnTransferButtonRipple = new mdc.ripple.MDCRipple($('#stn_transfer')[0]);
    // stnTransferButtonRipple.unbounded = true;
    var stnTransferDialog = new mdc.dialog.MDCDialog($('#stn_transfer_diag')[0]);
    var stnTransferSelect = new mdc.select.MDCSelect($('#stn_transfer_diag #change_type')[0]);
    var stnIntTickDirectionToggle = new mdc.iconButton.MDCIconButtonToggle($('#stn_transfer_diag #tick_direc')[0]);
    stnIntTickDirectionToggle.unbounded = true;

    var stnIntCity1Select = new mdc.select.MDCSelect($('#stn_transfer_diag #int_city_1')[0]);
    var stnIntCity2Select = new mdc.select.MDCSelect($('#stn_transfer_diag #int_city_2')[0]);
    $.getJSON('data/city_list.json', function(data) {
        data.forEach(function(c) {
            [1,2].forEach(i => 
                $(`#stn_transfer_diag #int_city_${i} select`).append(`<option value="${c.id}">${c.name[0]}</option>`)
            );
        });
    });

    var stnOSINameZHField = new mdc.textField.MDCTextField($('#stn_transfer_diag #osi_name_zh')[0]);
    var stnOSINameENField = new mdc.textField.MDCTextField($('#stn_transfer_diag #osi_name_en')[0]);
    var paidAreaToggle = new mdc.iconButton.MDCIconButtonToggle($('#stn_transfer_diag #paid_area')[0]);
    paidAreaToggle.unbounded = true;

    var stnIntLine1Select = new mdc.select.MDCSelect($('#stn_transfer_diag #int_line_1')[0]);
    var stnIntNameZH1Field = new mdc.textField.MDCTextField($('#stn_transfer_diag #int_name_zh_1')[0]);
    var stnIntNameEN1Field = new mdc.textField.MDCTextField($('#stn_transfer_diag #int_name_en_1')[0]);

    var stnIntLine2Select = new mdc.select.MDCSelect($('#stn_transfer_diag #int_line_2')[0]);
    var stnIntNameZH2Field = new mdc.textField.MDCTextField($('#stn_transfer_diag #int_name_zh_2')[0]);
    var stnIntNameEN2Field = new mdc.textField.MDCTextField($('#stn_transfer_diag #int_name_en_2')[0]);

    function _notchAllOutlines(n) {
        if (n == 1) {
            stnIntCity1Select.layout();
            stnIntLine1Select.layout();
            stnIntNameZH1Field.layout();
            stnIntNameEN1Field.layout();
        }
        if (n == 2) {
            stnIntCity2Select.layout();
            stnIntLine2Select.layout();
            stnIntNameZH2Field.layout();
            stnIntNameEN2Field.layout();
        }
        if (n == 0) {
            // OSI fields
            stnOSINameZHField.layout();
            stnOSINameENField.layout();
        }
    }

    function _showAllFields(n, show) {
        var sty = show ? '' : 'display:none';
        $(`#stn_transfer_diag #int_city_${n}, #int_line_${n}, #int_name_zh_${n}, #int_name_en_${n}`).attr('style', sty);
    }

    function _showIntTickDirecToggle(show) {
        var sty = show ? '' : 'display:none';
        $('#stn_transfer_diag #tick_direc').attr('style', sty);
    }

    function _showOSIFields(show) {
        var sty = show ? '' : 'display:none';
        $('#stn_transfer_diag #osi_name_zh').attr('style', sty);
        $('#stn_transfer_diag #osi_name_en').attr('style', sty);
        $('#stn_transfer_diag #paid_area').attr('style', sty)
    }

    // $('#stn_transfer').on('click', event => {
    //     if (stationSelect.value == 'null') {return;}
    //     stnTransferDialog.open();
    // });
    stnTransferDialog.listen('MDCDialog:opening', event => {
        // var stnId = stationSelect.value;
        var stnId = $('#panel_stations #selected_stn').attr('stn');
        var stnInfo = getParams().stn_list[stnId];
        stnTransferSelect.value = stnInfo.change_type.split('_')[0];

        if (stnInfo.change_type != 'none') {
            if (stnInfo.transfer[1].length) {
                stnIntCity1Select.value = stnInfo.transfer[1][0];
                stnIntNameZH1Field.value = stnInfo.transfer[1][3];
                stnIntNameEN1Field.value = stnInfo.transfer[1][4];
            } else {
                stnIntCity1Select.selectedIndex = 0;
                stnIntNameZH1Field.value = '';
                stnIntNameEN1Field.value = '';
            }
            if (stnInfo.transfer[2].length) {
                stnIntCity2Select.value = stnInfo.transfer[2][0];
                stnIntNameZH2Field.value = stnInfo.transfer[2][3];
                stnIntNameEN2Field.value = stnInfo.transfer[2][4];
            } else {
                stnIntCity2Select.selectedIndex = 0;
                stnIntNameZH2Field.value = '';
                stnIntNameEN2Field.value = '';
            }
        } else {
            stnIntCity1Select.selectedIndex = 0;
            stnIntCity2Select.selectedIndex = 0;
            stnIntNameZH1Field.value = '';
            stnIntNameEN1Field.value = '';
            stnIntNameZH2Field.value = '';
            stnIntNameEN2Field.value = '';
        }

        if (['none', 'int2'].includes(stnInfo.change_type)) {
            stnIntTickDirectionToggle.on = true;
        } else {
            stnIntTickDirectionToggle.on = (stnInfo.change_type.slice(-1) == 'r');
        }

        if (stnInfo.change_type.substring(0,3) == 'osi') {
            stnOSINameZHField.value = stnInfo.transfer[0][0];
            stnOSINameENField.value = stnInfo.transfer[0][1];

            paidAreaToggle.on = (stnInfo.change_type.substring(6,7) == 'p');
        } else {
            stnOSINameZHField.value = '';
            stnOSINameENField.value = '';

            paidAreaToggle.on = true;
        }
    });
    stnTransferDialog.listen('MDCDialog:opened', event => {
        stnTransferSelect.layout();
        _notchAllOutlines(1);
        _notchAllOutlines(2);
        _notchAllOutlines(0);
    });
    stnTransferDialog.listen('MDCDialog:closed', event => {
        if (event.detail.action == 'close') {return;}

        var stnId = $('#panel_stations #selected_stn').attr('stn');
        var type = stnTransferSelect.value;
        var tickDirec = stnIntTickDirectionToggle.on ? 'r' : 'l';
        var osi = [stnOSINameZHField.value, stnOSINameENField.value];
        var osiPaidArea = paidAreaToggle.on ? 'p' : 'u';
        var intInfo1 = [
            stnIntCity1Select.value, 
            stnIntLine1Select.value, 
            stnIntNameZH1Field.value, 
            stnIntNameEN1Field.value
        ];
        var intInfo2 = [
            stnIntCity2Select.value, 
            stnIntLine2Select.value, 
            stnIntNameZH2Field.value, 
            stnIntNameEN2Field.value
        ];
        console.log(stnId, `${type}_${osiPaidArea}${tickDirec}`, [osi, intInfo1, intInfo2]);
        if (type == 'none') {
            myLine.updateStnTransfer(stnId, type);
        } else {
            intInfo1.splice(
                2, 0, 
                $('#stn_transfer_diag #int_line_1 option').eq(stnIntLine1Select.selectedIndex).attr('colour')
            );
            switch (type) {
                case 'int2':
                    myLine.updateStnTransfer(stnId, type, [[], intInfo1, []]);
                    break;
                case 'osi11':
                    myLine.updateStnTransfer(stnId, `${type}_${osiPaidArea}${tickDirec}`, [osi, intInfo1, []]);
                    break;
                default:
                    intInfo2.splice(
                        2, 0, 
                        $('#stn_transfer_diag #int_line_2 option').eq(stnIntLine2Select.selectedIndex).attr('colour')
                    )
                    switch (type) {
                        case 'int3':
                            myLine.updateStnTransfer(stnId, `${type}_${tickDirec}`, [[], intInfo1, intInfo2]);
                            break;
                        case 'osi12':
                            myLine.updateStnTransfer(stnId, `${type}_${osiPaidArea}${tickDirec}`, [osi, intInfo1, intInfo2]);
                    }
            }
        }
    })
    stnTransferSelect.listen('MDCSelect:change', event => {
        if (event.detail.value == 'int2') {
            _showAllFields(1, true);
            _showAllFields(2, false);
            _showIntTickDirecToggle(false);
            _showOSIFields(false);
            _notchAllOutlines(1);
        } else if (event.detail.value == 'int3') {
            _showAllFields(1, true);
            _showAllFields(2, true);
            _showIntTickDirecToggle(true);
            _showOSIFields(false);
            _notchAllOutlines(1);
            _notchAllOutlines(2);
        } else if (event.detail.value == 'osi11') {
            _showAllFields(1, true);
            _showAllFields(2, false);
            _showIntTickDirecToggle(true);
            _showOSIFields(true);
            _notchAllOutlines(1);
            _notchAllOutlines(0);
        } else if (event.detail.value == 'osi12') {
            _showAllFields(1, true);
            _showAllFields(2, true);
            _showIntTickDirecToggle(true);
            _showOSIFields(true);
            _notchAllOutlines(1);
            _notchAllOutlines(2);
            _notchAllOutlines(0);
        } else {
            _showAllFields(1, false);
            _showAllFields(2, false);
            _showIntTickDirecToggle(false);
            _showOSIFields(false);
        }    
    });
    stnIntCity1Select.listen('MDCSelect:change', event => {
        if (event.detail.index == -1) {return;}
        $.getJSON(`data/${event.detail.value}.json`, data => {
            $('#stn_transfer_diag #int_line_1 select').empty();
            data.forEach(l => {
                $('#stn_transfer_diag #int_line_1 select').append(
                    `<option value="${l.id}" colour="${l.colour}">${l.name[0]}</option>`
                );
            });

            var stnId = $('#panel_stations #selected_stn').attr('stn');
            var stnInfo = getParams().stn_list[stnId];

            if (stnInfo.transfer) {
                var idx = $(`#stn_transfer_diag #int_line_1 select > [value="${stnInfo.transfer[1][1]}"]`).index();
                stnIntLine1Select.selectedIndex = (idx == -1) ? 0 : idx;
            } else {
                stnIntLine1Select.selectedIndex = 0;
            }
        });
    });
    stnIntCity2Select.listen('MDCSelect:change', event => {
        if (event.detail.index == -1) {return;}
        $.getJSON(`data/${event.detail.value}.json`, data => {
            $('#stn_transfer_diag #int_line_2 select').empty();
            data.forEach(l => {
                $('#stn_transfer_diag #int_line_2 select').append(
                    `<option value="${l.id}" colour="${l.colour}">${l.name[0]}</option>`
                );
            });

            var stnId = $('#panel_stations #selected_stn').attr('stn');
            var stnInfo = getParams().stn_list[stnId];

            if (stnInfo.transfer) {
                var idx = $(`#stn_transfer_diag #int_line_2 select > [value="${stnInfo.transfer[2][1]}"]`).index();
                stnIntLine2Select.selectedIndex = (idx == -1) ? 0 : idx;
            } else {
                stnIntLine2Select.selectedIndex = 0;
            }
        });
    });


    // Deletion
    // var stnDeleteButtonRipple = new mdc.ripple.MDCRipple($('#stn_delete')[0]);
    // stnDeleteButtonRipple.unbounded = true;
    var stnDeleteConfirmDialog = new mdc.dialog.MDCDialog($('#stn_delete_diag')[0]);
    var stnDeleteErrorDialog = new mdc.dialog.MDCDialog($('#stn_delete_err')[0]);
    // $('#stn_delete').on('click', event => {
    //     if (stationSelect.value == 'null') {return;}
    //     stnDeleteConfirmDialog.open();
    // });
    stnDeleteConfirmDialog.listen('MDCDialog:opening', event => {
        var stnNames = $('#stations_list #selected_stn span:last-child').html().split(':')[1];
        $('#stn_delete_diag .mdc-dialog__content').html(
            `Are you sure to delete station ${stnNames}? You can't undo this action. `
        );
    });
    stnDeleteConfirmDialog.listen('MDCDialog:closed', event => {
        if (event.detail.action == 'close') {return;}
        var stnId = $('#panel_stations #selected_stn').attr('stn');
        // var idx = stationSelect.selectedIndex;
        // Remove from data and svg
        if (myLine.removeStn(stnId)) {
            // Remove station from selection
            // $(`#stn_list [value=${stnId}]`).remove();
            $('#stn_select_diag')[0].dispatchEvent(new CustomEvent('MDCDialog:closed', {'detail':{'action':'none'}}));
            // $('#stn_list option').eq(stationSelect.selectedIndex).remove();
            $(`#stn_add_diag #pivot [value=${stnId}]`).remove();
            // stationSelect.selectedIndex = (idx==0) ? 0 : idx-1;
        } else {
            stnDeleteErrorDialog.open();
        }
    });
}

function initSavePanel() {
    var saveList = new mdc.list.MDCList($('#panel_save .mdc-list')[0]);
    var saveListItemRipple = saveList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

    saveList.listen('MDCList:action', event => {
        console.log(event.detail);
        switch (event.detail.index) {
            case 0:
                var link = document.createElement('a');
                var data = new Blob([sessionStorage.all_params], {type: 'application/json;charset=utf-8'});
                var url = window.URL.createObjectURL(data);
                link.href = url;
                link.download = 'railmap_config.json';
                // $('body').append(link);
                link.click();
                // document.body.removeChild(link);
                URL.revokeObjectURL(url);
                break;
            case 1:
                $('#upload_file').click();
                break;
            case 2:
                resetDialog.open();
                break;
        }
    });

    // var uploadButtonRipple = new mdc.ripple.MDCRipple($('#upload_json')[0]);
    // uploadButtonRipple.unbounded = true;
    var importDialog = new mdc.dialog.MDCDialog($('#import_diag')[0]);
    var importedFile = undefined;
    // $('#upload_json').on('click', event => {
    //     $('#upload_file').click();
    // });
    $('#upload_file').on('change', event => {
        console.log(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function(e) {
            importedFile = JSON.parse(e.target.result);
            $('#import_diag .mdc-dialog__content').html(
                describeParams(importedFile)
            );
            importDialog.open();
        };
        reader.readAsText(event.target.files[0]);
    });
    importDialog.listen('MDCDialog:closed', event => {
        if (event.detail.action == 'close') {return;}

        Line.clearSVG();
        sessionStorage.all_params = JSON.stringify(importedFile);
        location.reload(true);
    });

    // var resetButtonRipple = new mdc.ripple.MDCRipple($('#reset_json')[0]);
    // resetButtonRipple.unbounded = true;
    var resetDialog = new mdc.dialog.MDCDialog($('#reset_diag')[0]);
    // $('#reset_json').on('click', event => {
    //     resetDialog.open();
    // });
    resetDialog.listen('MDCDialog:closed', event => {
        if (event.detail.action == 'close') {return;}

        $.getJSON(`templates/default.json`, data => {
            sessionStorage.all_params = JSON.stringify(data);
            location.reload(true);
        });
    })
}