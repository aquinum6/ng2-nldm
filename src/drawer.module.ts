import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from './directives/drawer.service';
import { NativeDrawer } from './directives/drawer.component';

@NgModule({
    imports: [ CommonModule ],
    declarations: [ NativeDrawer ],
    exports: [ NativeDrawer ],
    providers: [ DrawerService ]
})
export class DrawerModule { }