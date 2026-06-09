import { EventInterface } from "./event.interface";

export interface EventButtons {
    createEventButton: string;
    editEventButton: string;
    createPostEventButton: string;
    editPostEventButton: string;
    getReportButton: string;
    getPostEventReportButton: string;
    continueButton: string;
    deleteEventButton: string;
  }

  export interface EventsResponse {
    events: EventInterface[];
    buttons: EventButtons;
    page: number;
    totalPages: number;
  }

  export const defaultButtons: EventButtons = {
    createEventButton: 'Створити опитувальник',
    editEventButton: 'Відкрити',
    createPostEventButton: 'Створити копію',
    editPostEventButton: 'Редагувати копію',
    getReportButton: 'Звіт',
    getPostEventReportButton: 'Звіт копії',
    continueButton: 'Продовжити',
    deleteEventButton: 'Видалити'
  };
