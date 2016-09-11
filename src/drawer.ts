import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from './directives/service';
import { NativeDrawer } from './directives/main';

@NgModule({
    imports: [ CommonModule ],
    declarations: [ NativeDrawer ],
    exports: [ NativeDrawer ],
    providers: [ DrawerService ]
})
export class DrawerModule {}