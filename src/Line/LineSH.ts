import { RMGLine } from './Line';
import { RMGStationSH, IntStationSH, station_id } from '../Station/StationSH';
import { RMGStation } from '../Station/Station';

import { Name, StationInfo, RMGParam, DirectionLong } from '../types';
import { setParams } from '../utils';

export class RMGLineSH extends RMGLine {
    constructor(param) {
        super(param);
    }

    _initStnInstance(stnId: string, stnInfo: StationInfo): RMGStation {
        switch (stnInfo.change_type) {
            case 'int2':
            case 'int3_l':
            case 'int3_r':
                return new IntStationSH(stnId, stnInfo);
            case 'osi11_ul':
            case 'osi11_pl':
            case 'osi11_ur':
            case 'osi11_pr':
            case 'osi12_ul':
            case 'osi12_pl':
            case 'osi12_ur':
            case 'osi12_pr':
            case 'osi21_ul':
            case 'osi21_pl':
            case 'osi21_ur':
            case 'osi21_pr':
            case 'osi22_ul':
            case 'osi22_pl':
            case 'osi22_ur':
            case 'osi22_pr':
            default:
                return new RMGStationSH(stnId, stnInfo);
        }
    }

    // draw the destination
    drawDestInfo() {
        $('#station_info_shmetro > #platform > text').text(this._platformNum);

        var bcr = $('#station_info_shmetro > #dest_text')[0].getBoundingClientRect();
        var flagLength = 160 + 150 + bcr.width + 45 + 50;

        // get the height
        let dh = this._svgHeight - 300

        // arrow
        var isLeft = (this._direction == 'l') ? 1 : -1;
        var arrowX = (this._svgDestWidth - isLeft * flagLength) / 20;
        arrowX = (this._direction == 'l') ? arrowX : this._svgDestWidth - 20;
        var arrowRotate = 90 * (1 - isLeft);
        $('#station_info_shmetro > #arrow_left_use').attr(
            'transform', `translate(${arrowX},${135 + dh})rotate(${arrowRotate})`
        )

        // not in use now
        var platformNumX = arrowX + isLeft * (160 + 50 + 75);
        $('#station_info_shmetro > #platform').attr(
            'transform', `translate(${platformNumX},${130 + dh})`
        )

        // list the destination text
        // Todo: fix svg_dest_width*0.8, this has only been tested on 1000 width
        if (this._direction === 'r') {
            var txtAnchor = 'end';
            var destNameX = this._svgDestWidth * 0.8;
        } else {
            var txtAnchor = 'start';
            var destNameX = this._svgDestWidth * 0.2;
        }
        $('#station_info_shmetro > #dest_text').attr({
            transform: `translate(${destNameX},${135 + dh})`,
            'text-anchor': txtAnchor
        });

        // for each left valid destinations, get the name from id
        var [destinations_zh, destinations_en]: String[][] = [[], []]
        this[`${this._direction}ValidDests`].forEach(stn => {
            destinations_zh.push(this.stations[stn].name[0])
            destinations_en.push(this.stations[stn].name[1].replace('\\',' ')) // Chito: replace \ by space
        });
        $('#station_info_shmetro > #dest_text > text:first-child').text(`往${destinations_zh.join("，")}`)
        $('#station_info_shmetro > #dest_text > text:last-child').text(`To ${destinations_en.join(", ")}`)

        // prepare for the line name
        let lineNameX = this._direction === 'l' ? this._svgDestWidth : 360
        var [lineNameZH, lineNameEN] = this._lineNames;

        // line starts with numbers or letters
        var lineNumber = lineNameZH.match(/(\d*)\w+/)
        if (lineNumber) {
            lineNameX -= 180;
            lineNameZH = "号线"
            $('#station_info_shmetro > #line_number > rect').attr({
                fill: 'var(--rmg-theme-colour)',
                transform: `translate(${lineNameX - 150},${70 + dh})`,
                width: 125, height: 125 // Chito: reset width and height (from pure-chinese name)
            })
            $('#station_info_shmetro > #line_number > text')
                .show().text(lineNumber[0])
                .attr({
                    fill: 'var(--rmg-theme-fg)',
                    transform: `translate(${lineNameX - 95},${170 + dh})`,
                    style: 'letter-spacing:-2px', // Chito: 00 and 88 can fit in the box now (webkit)
                    'text-anchor': 'middle',
                    'dominant-baseline': 'central', // Chito: move baseline of text to the central
                })

            // Chito: If match format X号线, "号线" always black
            // ignore inherit style from g#line_name_text
            $('#station_info_shmetro > #line_name_text text').attr('fill', 'black');
        } else {
            lineNameX -= 280;
            $('#station_info_shmetro > #line_number > rect').attr({
                fill: 'var(--rmg-theme-colour)', 
                transform: `translate(${lineNameX - 10},${60 + dh})`,
                width: 260,
                height: 150
            })
            $('#station_info_shmetro > #line_number > text').hide()

            // Chito: If not match format X号线, use inherit style
            $('#station_info_shmetro > #line_name_text text').removeAttr('fill');

            // Todo: set the eng in the middle
            $('#station_info_shmetro > #line_name_text > text:last-child').attr('dx', 10)
        }

        // set the line name
        $('#station_info_shmetro > #line_name_text > text:first-child').text(lineNameZH)
        $('#station_info_shmetro > #line_name_text > text:last-child').text(lineNameEN)
        $('#station_info_shmetro > #line_name_text').attr({
            transform: `translate(${lineNameX},${135 + dh})`,
            'text-anchor': 'start'
        });

        // the last decoration line
        let path = ''
        if (this._direction == 'l') {
            path = `M38,10 H ${this._svgDestWidth - 20} V 24 H 24 Z`
        } else {
            path = `M24,10 H ${this._svgDestWidth - 30} l 12,12 H 24 Z`
        }
        $('#line_shmetro_use').attr({
            fill: 'var(--rmg-theme-colour)',
            transform: `translate(0,${220 + dh})`,
            d: path,
        })
    }

    // rewrite this to append dom and then getBoundingClientRect
    // to get the exact position where int icon can be fit
    drawStns() {
        for (let [stnId, stnInstance] of Object.entries(this.stations)) {
            if (['linestart', 'lineend'].includes(stnId)) { continue; }
            $('#stn_icons').append(stnInstance.html);
        }
        $('#stn_icons').html($('#stn_icons').html()); // Refresh DOM

        for (let [stnId, stnInstance] of Object.entries(this.stations)
            .filter(stn => stn[1] instanceof IntStationSH) as [string, IntStationSH][]) {
            $(`#rmg-name__shmetro--${stnId}`).parent().append(stnInstance.ungrpIconHTML)
        }
        $('#stn_icons').html($('#stn_icons').html()); // Refresh DOM
    }

    // rewrite this to change the y of branch station
    _stnYShare(stnId): number {
        if (this.branches[0].includes(stnId)) return 0;
        else return 3
    }

    _linePath(stnIds: string[], type?: 'main' | 'pass'): string {
        var [prevId, prevY, prevX]: [string?, number?, number?] = []
        var path: { [key: string]: number[] } = {}
        const e = 30

        stnIds.forEach(stnId => {
            var [x, y] = ['_stnRealX', '_stnRealY'].map(fun => this[fun](stnId))
            if (!prevY && prevY !== 0) {
                [prevId, prevX, prevY] = [stnId, x, y];
                path['start'] = [x, y];
                return
            }
            if (y === 0) {
                // merge back to main line
                if (y != prevY) {
                    path['bifurcate'] = [prevX, prevY]
                }
            } else {
                // on the branch line
                if (y != prevY) {
                    path['bifurcate'] = [x, y]
                }
            }
            path['end'] = [x, y];
            [prevId, prevX, prevY] = [stnId, x, y];
        });

        // generate path
        if (!path.hasOwnProperty('start')) {
            // no line generated
            // keys in path: none
            return ''
        } else if (!path.hasOwnProperty('end')) {
            // litte line (only beyond terminal station)
            // keys in path: start
            let [x, y] = path['start']
            if (type === 'main') {
                // current at terminal(end) station, draw the litte main line
                if (this._direction === 'l') {
                    return `M ${x},${y - 6} L ${x - e},${y - 6} l -12,12 L ${x},${y + 6} Z`
                } else {
                    return `M ${x},${y - 6} L ${x + e},${y - 6} l 12,12 L ${x},${y + 6} Z`
                }
            } else {
                // type === 'pass'
                // current at terminal(start) station, draw the litte pass line
                if (this._direction === 'l') {
                    return `M ${x},${y - 6} L ${x + e},${y - 6} l 0,12 L ${x - e},${y + 6} Z`
                } else {
                    return `M ${x - e},${y - 6} L ${x},${y - 6} l 0,12 L ${x - e},${y + 6} Z`
                }
            }
        }
        else if (!path.hasOwnProperty('bifurcate')) {
            // general main line
            // keys in path: start, end
            let [x, y] = path['start'], h = path['end'][0]
            if (type === 'main') {
                if (this._direction === 'l') {
                    return `M ${x - e},${y - 6} H ${h} l 0,12 L ${x - 42},${y + 6} Z`
                } else {
                    return `M ${x},${y - 6} H ${h + e} l 12,12 L ${x},${y + 6} Z`
                }
            } else {
                // type === 'pass'
                if (this._direction === 'l') {
                    return `M ${x - e},${y - 6} H ${h + e} l 0,12 L ${x - e},${y + 6} Z`
                } else {
                    return `M ${x - e},${y - 6} H ${h + e} l 0,12 L ${x - e},${y + 6} Z`
                }
            }
        } else {
            // main line bifurcate here to become the branch line
            // and path return here are only branch line
            // keys in path: start, bifurcate, end

            // Todo: disable lower branch
            let [x, y] = path['start'], h = path['end'][0]
            let [xb, yb] = path['bifurcate'], [xm, ym] = path['end']
            if (type === 'main') {
                if (this._direction === 'l') {
                    if (ym > y) {
                        // main line, left direction, center to upper
                        return `M ${x - e},${y - 6} H ${xb + e} L ${xm},${ym - 6} l 0,12 L ${xb + e},${yb + 6} L ${x - e - 12},${y + 6} Z`
                    } else {
                        // main line, left direction, upper to center
                        // this same as the other, but replace x with xm and xm with x
                        return `M ${xm},${ym - 6} H ${xb - e} L ${x},${y - 6} l 0,12 L ${xb - e},${yb + 6} L ${xm},${ym + 6} Z`
                    }
                } else {
                    if (ym > y) {
                        // main line, right direction, upper to center
                        return `M ${x},${y - 6} H ${xb + e} L ${xm},${ym - 6} l 0,12 L ${xb + e},${yb + 6} L ${x},${y + 6} Z`
                    } else {
                        // main line, right direction, center to upper
                        // this same as the other, but replace x with xm and xm with x
                        return `M ${xm + e},${ym - 6} H ${xb - e} L ${x},${y - 6} l 0,12 L ${xb - e},${yb + 6} L ${xm + e + 12},${ym + 6} Z`
                    }
                }
            } else {
                // type === 'pass'
                if (this._direction === 'l') {
                    if (ym > y) {
                        // pass line, left direction, center to upper
                        return `M ${x - e},${y - 6} H ${xb + e} L ${xm},${ym - 6} l 0,12 L ${xb + e},${yb + 6} L ${x - e},${y + 6} Z`
                    } else {
                        // pass line, left direction, upper to center
                        // this same as the other, but replace x with xm and xm with x
                        return `M ${x},${y - 6} L ${xb - e},${yb - 6} H ${xm + e} l 0,12 L ${xb - e},${yb + 6} L ${x},${y + 6} Z`
                    }
                } else {
                    if (ym > y) {
                        // pass line, right direction, upper to center
                        return `M ${x - e},${y - 6} H ${xb + e} L ${xm},${ym - 6} l 0,12 L ${xb + e},${yb + 6} L ${x - e},${y + 6} Z`
                    } else {
                        // pass line, right direction, center to upper
                        // this same as the other, but replace x with xm and xm with x
                        return `M ${x},${y - 6} L ${xb - e},${yb - 6} H ${xm + e} l 0,12 L ${xb - e},${yb + 6} L ${x},${y + 6} Z`
                    }
                }
            }
        }
    }

    // draw the line in railmap
    drawLine() {
        $('.rmg-line').removeClass('rmg-line__mtr').addClass('rmg-line__shmetro');

        this.branches.map(branch => {
            var lineMainStns = branch.filter(stnId => this.stations[stnId].state >= 0);
            var linePassStns = branch.filter(stnId => this.stations[stnId].state <= 0);

            if (lineMainStns.length === 1) {
                linePassStns = branch;
            }

            if (lineMainStns.filter(stnId => linePassStns.indexOf(stnId) !== -1).length == 0 && lineMainStns.length) {
                // if two set disjoint
                if (linePassStns[0] === branch[0]) {
                    // -1 -1 1 1
                    linePassStns.push(lineMainStns[0]);
                } else if (lineMainStns[0] === branch[0] && lineMainStns[lineMainStns.length-1] === branch[branch.length-1] && linePassStns.length) {
                    linePassStns = branch;
                    lineMainStns = [];
                } else {
                    // 1 1 -1 -1
                    linePassStns.unshift(lineMainStns[lineMainStns.length-1]);
                }
            }
            
            // rewrite the second parameter to get the path correctly
            $('#line_main').append(
                $('<path>', {
                    fill: 'var(--rmg-theme-colour)',
                    d:this._linePath(lineMainStns, 'main')
                })
            );
            $('#line_pass').append(
                $('<path>', {
                    fill: '#aaa',
                    d:this._linePath(linePassStns, 'pass')
                })
            );
        });

        $('#line_main').html($('#line_main').html());
        $('#line_pass').html($('#line_pass').html());

        $('#railmap > #main').attr('transform', `translate(0,${this._svgHeight - 63})`)
    }

    // Todo: use css var
    fillThemeColour() {
        super.fillThemeColour();

        $('style#global').text(`:root{--rmg-theme-colour:${this._themeColour};--rmg-theme-fg:${this._fgColour}}`);
    }

    updateStnNameBg() {
        $('#current_bg').hide();  // fix the mysterious black rect
    }

    // rewrite this to make sure the line is draw before color
    static initSVG(line) {
        line.drawSVGFrame();
        line.showFrameOuter();
        line.drawStns();

        // change the func call here
        line.drawLine();
        line.fillThemeColour();
        // change the func call here

        line.drawStrip();
        line.drawDestInfo();
        line.updateStnNameBg();
    }

    // rewrite this to call fillThemeColour when flip direction
    set direction(val) {
        super.direction = val

        this.fillThemeColour()
    }

    // rewrite this to call fillThemeColour when set current station
    set currentStnId(val) {
        super.currentStnId = val

        this.fillThemeColour()
    }

    set lineNames(val: Name) {
        super.lineNames = val;
        this.drawDestInfo();
    }

    // rewrite this to get drawStns and recalled
    updateStnTransfer(stnId: string, type, info = null) {
        super.updateStnTransfer(stnId, type, info)

        this.fillThemeColour()

        // clear the original stations
        $('#stn_icons').empty()
        this.drawStns()
    }

    // rewrite this to call fillThemeColour when add station
    addStn(prep: 'before' | 'after', stnId: string, loc, end: string): [string, StationInfo] {
        let [newId, newInfo] = super.addStn(prep, stnId, loc, end)
        this.fillThemeColour()
        return [newId, newInfo]
    }

    set svgHeight(val: number) {
        super.svgHeight = val
        this.drawLine()
    }

    set padding(val: number) {
        super.padding = val;
        this.fillThemeColour();
    }

    set branchSpacing(val: number) {
        super.branchSpacing = val;
        this.fillThemeColour();
    }

    removeStn(stnId: string) {
        if (super.removeStn(stnId)) {
            this.fillThemeColour();
            return true;
        } else {
            return false;
        }
    }

    updateBranchType(stnId: string, direction: DirectionLong, type: 'through' | 'nonthrough') {
        // Chito: This method should be remove when this._stnState() is updated. 
        if (!super.updateBranchType(stnId, direction, type)) {return false;}
        this.fillThemeColour();
        return true;
    }

    updateBranchFirst(stnId: string, direction: DirectionLong, first: string) {
        if (super.updateBranchFirst(stnId, direction, first)) {
            this.fillThemeColour();
            return true;
        } else {
            return false;
        }
    }

    updateBranchPos(stnId: string, direction: DirectionLong, pos: 0 | 1) {
        // Chito: This method should be remove when this._stnState() is updated. 
        if (!super.updateBranchPos(stnId, direction, pos)) {return false;}
        this.fillThemeColour();
        return true;
    }
}
