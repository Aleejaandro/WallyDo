import React from 'react';
import BookIcon from '../icons/book.svg';
import BriefcaseIcon from '../icons/briefcase.svg';
import BarbellIcon from '../icons/barbell.svg';
import PersonIcon from '../icons/user.svg';
import HeartIcon from '../icons/heart.svg';
import FolderIcon from '../icons/folder.svg';

import CheckIcon from '../icons/check.svg';
import HourglassIcon from '../icons/hourglass.svg';
import PauseIcon from '../icons/play.svg';

import CalendarIcon from '../icons/calendar.svg';
import ClockIcon from '../icons/clock.svg';
import ListIcon from '../icons/list-bullets.svg';
import ListCheckIcon from '../icons/list-checks.svg';
import ListIconSimple from '../icons/list.svg';
import WallyLogoIcon from '../icons/wallydo_logo.svg';
import WallyLogo2Icon from '../icons/wallydo_logo2.svg';

import ClipboardIcon from '../icons/clipboard-text.svg';
import EyeIcon from '../icons/eye.svg';



// Exportarlos agrupados o por nombre
export {
  CalendarIcon,
  ClockIcon,
  ListIcon,
  ListCheckIcon,
  ListIconSimple,
  WallyLogoIcon,
  WallyLogo2Icon,
  ClipboardIcon,
  FolderIcon,
  EyeIcon,
};

export const getSvgByCategoria = (categoria: string): JSX.Element => {
  switch (categoria) {
    case 'Estudio': return <BookIcon width={14} height={14} />;
    case 'Trabajo': return <BriefcaseIcon width={14} height={14} />;
    case 'Deporte': return <BarbellIcon width={14} height={14} />;
    case 'Personal': return <PersonIcon width={14} height={14} />;
    case 'Salud': return <HeartIcon width={14} height={14} />;
    default: return <FolderIcon width={14} height={14} />;
  }
};

export const getSvgByEstado = (estado: string): JSX.Element => {
  switch (estado) {
    case 'Completada': return <CheckIcon width={14} height={14} />;
    case 'En curso': return <HourglassIcon width={14} height={14} />;
    case 'Sin empezar': return <PauseIcon width={14} height={14} />;
    default: return <PauseIcon width={14} height={14} />;
  }
};
