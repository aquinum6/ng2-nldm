# ng2-nldm
Angular 2 Native Like Drawer Menu
## How to use

1. First import DrawerModule to your app.

```typescript
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }   from './app.component';

import { DrawerModule } from '../src';

@NgModule({
    imports:      [ BrowserModule, DrawerModule ],
    declarations: [ AppComponent ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }
```

2. Then you can use native-drawer tag to create instance of drawer.

```html
<native-drawer>
  Drawer Content      
</native-drawer>
```

**WARNING!** Do not create more than one instance of drawer at any time. Drawer shared most of logic with DrawerService and creating more than one will bring issues.

## Drawer component

With drawer component you can use setting options

* **width** - You can use number, string, string with px or string with %
```html
<native-drawer [width]="_width"><!-- not tested yet -->
<native-drawer width="300">
<native-drawer width="300px">
<native-drawer width="80%">
```
* **disabled** - You can disable drawer and it will stay hidden, but service is still working. You can use boolean, string or number (true, 'true', 1, '1' <- gets true, other values are false)
* **locked** - You can lock drawer from any touch/click events. Drawer is still active and you can manage it with DrawerService but it wont react to usual interaction. Values are the same as for _disabled_

**ISSUE!** Have not chance to check yet, but drawer component is using _window.innerWidth_ which may create problems when working with Angular Universal

**ISSUE!** There is known issue of overall shadow flickering sometimes when drawer is open by swipe.

## Drawer service

To use drawer service you need to import it to desired component.
```typescript
import { Component } from '@angular/core';
import { DrawerService } from '../src';;

@Component({
    selector: 'something',
    template: `...`
})
export class SomethingComponent {
    constructor(_drawerService: DrawerService){}
}
```

### Methods and properties

* get **resizeCloak$** - Observable<boolean>; it will let you know when resize event is happening. Used by component to hide animations during resize.
* get **position$** - Observable<number>; returns current position of drawer (0 - closed, width - open).
* get **width$** - Observable<number>; returns width of drawer.
* get **onTouch$** - Observable<boolean>; returns when drawers is touched/clicked (basic movement behaviour).
* set **width(number)** - let you set new size of drawer.

* **open(isLockable?: boolean)** - opens drawer. Can be set as lockable, and if so it won't react if lock is set on drawer.
* **close(isLockable?: boolean)** - close drawer. Can be set as lockable, and if so it won't react if lock is set on drawer.
* **reset()** - reset all settings to default.
* **toggle(stream: Subject<any>)** - create toggle action for drawer. Good for use with burger menu
```typescript
@Component({
    selector: 'something',
    template: `
    <button (click)="_toggleButton$.next($event)">Toggle</button>
    `
})
export class AppComponent {
    private _toggleButton$: Subject<Event> = new Subject<Event>();
    
    constructor(_drawerService: DrawerService){
        _drawerService.toggle(this._toggleButton$);
    }
}
```
* **disable(disabled?: boolean)** - same as for component property.
* **lock(locked?: boolean)** - same as for component property.

## What next
1. Control number of instances
2. Replace window.innerWidth for something more correct with ng2
3. Replace import { Observable } from 'rxjs/Rx' to proper import
4. Create nice demo
5. Create bundle
6. Add burger button to looks like native and works with drawer straight from the box

