import { Component, ChangeDetectionStrategy, trigger, style, transition, animate, Input, OnDestroy, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DrawerService } from './drawer.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
    moduleId: module.id,
    selector: 'native-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.css'],
    animations: [
        trigger('overall', [
            transition('* => void', [
                animate('0.3s', style({
                    opacity: '0'
                }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NativeDrawer implements OnDestroy{

    @Input() set width(_width: number | string){

        //TODO: un-subscribe
        if(typeof _width === 'string'){
            if(_width[_width.length - 1] === '%') {
                this._window$.subscribe(width => {
                    this.__drawerService.width =
                        Math.floor(width * parseInt(_width.slice(0, -1)) / 100);
                });
            } else {
                this.__drawerService.width =
                    parseInt(_width.slice(-2) === 'px' ? _width.slice(0, -2) : _width);
            }
        } else {
            this.__drawerService.width = _width;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize (event) {
        this._window$.next(event.target.innerWidth);
    }

    //TODO: make sure that only one instance of drawer is active at given time
    //TODO: window.innerWidth might be not working properly with Angular Universal
    private _window$: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerWidth);
    private _width$: BehaviorSubject<number>;
    private _onTouch$: BehaviorSubject<boolean>;
    private _position$: BehaviorSubject<number>;
    private _cloak$: Observable<boolean>;

    constructor(private __drawerService: DrawerService, private __sanitizer: DomSanitizer){
        this._position$ = __drawerService.position$;
        this._width$ = __drawerService.width$;
        this._onTouch$ = __drawerService.onTouch$;
        this._cloak$ = __drawerService.resizeCloak$;
    }

    getMove(ev){
        this.__drawerService.getMove(ev);
    }

    overallClose(){
        this.__drawerService.close(true);
    }

    styleSanitize(val) {
        return this.__sanitizer.bypassSecurityTrustStyle('translate(' + val + 'px, 0) translateZ(0)');
    }
    //noinspection JSMethodCanBeStatic
    getOpacity(pos){
        let op: string = pos.toFixed(2);
        return parseFloat(op) < 1 ? op : '1';
    }

    ngOnDestroy(): void {
        this.__drawerService.reset();
    }
}