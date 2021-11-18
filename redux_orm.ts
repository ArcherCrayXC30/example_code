import { createSelector } from 'redux-orm';
import orm from './index';

export const properties = createSelector(orm.Property);
export const clients = createSelector(orm.Client);

export const locations = createSelector(orm.Location);
export const directions = createSelector(
  orm,
  (session) => session.Location.all().toRefArray().filter((item) => !item.capital),
);
export const deals = createSelector(orm.Deal);

export const openDeals = createSelector(
  orm,
  (session) => session.Deal.all().toRefArray().filter((item) => item.status === 0),
);

export const defferDeals = createSelector(
  orm,
  (session) => session.Deal.all().toRefArray().filter((item) => item.status === 1),
);
