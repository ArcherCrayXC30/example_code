import * as R from 'ramda';

/**
 * Removes from the database all data referenced using virtual fields from an input object
 * NOTE: cache is required to handle cyclic references (e.g. Dish and DishGroup)
 */
const removeRelated = (item, cache) => {
  R.forEachObjIndexed((_, fieldKey) => {
    R.forEach((relatedItem) => {
      const model = relatedItem.getClass();
      if (!cache.has(model)) {
        cache.set(model, new Set());
      }
      const set = cache.get(model);
      if (set.has(relatedItem.key)) {
        return; // this item is already scheduled for removal or removed
      }
      set.add(relatedItem.key);
      removeRelated(relatedItem, cache);
      relatedItem.delete();
    }, item[fieldKey].toModelArray());
  }, item.getClass().virtualFields);
};

export default item =>
  removeRelated(item, new Map());
