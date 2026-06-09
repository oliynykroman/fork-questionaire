import {EventNavItemInterface, PageNavItemInterface} from './nav-item.interface';


export interface EventNavInterface extends NavBaseInterface {
  items: EventNavItemInterface[];
}

export interface PageNavInterface extends NavBaseInterface {
  items: PageNavItemInterface[];
}

export interface NavBaseInterface {
  title?: string;
  isStaticNav?: boolean;
}

