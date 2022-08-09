import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTabsModule } from '@angular/material/tabs'
import { MatCardModule } from '@angular/material/card'
/* Global Angular Material class*/
/* To use a material in any component, just import it (using new angular material imports)
   and add the import to the MaterialImports var and imports below */
const MaterialComponents = [
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatSidenavModule,
  MatCardModule,
  MatTabsModule
]

@NgModule({
  imports: [
    MaterialComponents
  ],
  exports: [MaterialComponents]
})
export default class MaterialModule { }
