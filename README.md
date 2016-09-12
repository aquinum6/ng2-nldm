# ng2-nldm
Angular 2 Native Like Drawer Menu
## Basic Use

To use drawer you need to import DrawerModule to app.

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

Module at the moment exists as a bunch of .ts (.js) files but it will be bundled (umd) for dist.

Use following code in desired place of you application to create drawer.

```html
<native-drawer>
  Drawer Content      
</native-drawer>
```

### Width

Default width is set to 300px. You can change that with "width" attribute. Width accept number (200), string (200), string + px (200px) or precentage (80%).

## Service

Drawer also deliver service that contains usefull functions and properties.

* get position$() - returns drawer current position; BehaviorSubject<number>
* get active$() - returns if drawer is currently moved by touch; BehaviorSubject<boolean>
* open() - open drawer
* close() - close drawer


Remeber to have only one instance of drawer active. This will be added in future.
