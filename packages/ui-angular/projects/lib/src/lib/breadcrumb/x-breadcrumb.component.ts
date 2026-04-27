import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { BreadcrumbItem } from './breadcrumb-item'

/**
 * Canonical xtrakt breadcrumb (Angular). Mirrors the Portal pattern and the
 * Vue equivalent in `@xtrakt-ai/ui-vue`. Driven by --xt-* tokens shipped in
 * `@xtrakt-ai/design-tokens`.
 *
 * Usage:
 *   <x-breadcrumb [items]="[{label:'Tickets',to:'/tickets'},{label:ticket.subject}]"/>
 */
@Component({
  selector: 'x-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="xt-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <ng-container *ngFor="let item of items; let i = index; let last = last">
          <li [class.active]="last">
            <a *ngIf="item.to && !last" [routerLink]="item.to">{{ item.label }}</a>
            <span *ngIf="!item.to || last">{{ item.label }}</span>
          </li>
          <li *ngIf="!last" class="sep" aria-hidden="true">/</li>
        </ng-container>
      </ol>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .xt-breadcrumb {
      font-family: var(--xt-font, 'Inter', system-ui, sans-serif);
      font-size: 12px;
      color: var(--xt-fg-muted, #425466);
    }
    .xt-breadcrumb ol {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    .xt-breadcrumb li.active {
      color: var(--xt-fg, #0a2540);
      font-weight: 500;
    }
    .xt-breadcrumb a {
      color: var(--xt-fg-muted, #425466);
      text-decoration: none;
      transition: color 150ms cubic-bezier(.2, .8, .2, 1);
    }
    .xt-breadcrumb a:hover {
      color: var(--xt-brand, #635bff);
    }
    .xt-breadcrumb .sep {
      color: var(--xt-fg-subtle, #8792a2);
    }
  `],
})
export class XBreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = []
}
