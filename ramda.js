import * as R from 'ramda';
import { call, put, all, takeEvery, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';

import * as api from 'utils/api';
import isLocalKey from 'utils/isLocalKey';

import getErrorFromResponse from 'redux/utils/getErrorFromResponse';
import getServerFields from 'redux/utils/getServerFields';

import { setNotification } from 'redux/modules/notification';

import getItemByKey from 'redux/selectors/getItemByKey';

import getSubitemsEffect from 'redux/utils/getSubitemsEffect';
import subitems from 'redux/modules/subitems';

const successAction = (action, payload) => {
  const { type } = action;

  return {
    type: `${type}_SUCCESS`,
    payload,
  };
};

const failureAction = (action, payload) => {
  const { type } = action;

  return {
    type: `${type}_FAILURE`,
    payload,
  };
};

const remove = (action, payload) => {
  const { type } = action;

  return {
    type: type.replace('SAVE', 'REMOVE'),
    payload,
  };
};

function* fetchData(action) {
  try {
    const response = yield call(api.get, action.payload);

    const effects = getSubitemsEffect(response, subitems);

    yield all(effects);
    yield put(successAction(action, {
      ...action.payload,
      response,
    }));
  } catch (error) {
    yield put(failureAction(action, {
      ...action.payload,
      error,
    }));
  }
}

function* saveData(action) { // eslint-disable-line complexity
  const updateRequest = params => api.put(params);
  const createRequest = params => api.post({
    ...params,
    key: params.tableKey,
  });
  const { payload } = action;

  try {
    if (payload.withNotification) {
      yield put(setNotification({
        type: 'global',
        isProcess: true,
      }));
    }

    if (payload.form) {
      yield put(startSubmit(payload.form));
    }

    const item = yield select(getItemByKey(payload.key));
    const key = R.propOr(payload.key, 'key', item || {});
    const isLocalItem = isLocalKey(key);
    const request = isLocalItem ? createRequest : updateRequest;
    const data = getServerFields(item)

    const isAnyLocal = R.any(isLocalKey, R.values(data));
    const shouldSend = !R.isEmpty(data) && !payload.isLocal && !isAnyLocal && !item.isShouldSaved;
    const response = shouldSend ? yield call(request, {
      ...payload,
      key,
      data,
    }) : undefined;

    const newKey = R.pathOr(null, ['data', 'key'], response);
    const newItem = yield select(getItemByKey(payload.key));

    yield put(successAction(action, {
      ...payload,
      response,
    }));

    if (newKey && newItem && newItem.isShouldSaved) {
      yield put({
        type: action.type,
        payload: {
          ...payload,
          key: newKey,
          data: {},
        },
      });
    }

    if (payload.form) {
      yield put(stopSubmit(payload.form));
    }

    if (payload.withNotification) {
      yield put(setNotification({
        type: 'global',
        isDone: true,
        isProcess: false,
      }));
    }

    if (item.markToDelete) {
      yield put(remove(action, {
        key: payload.key,
      }));
    }
  } catch (error) {
    console.error(error);
    const errorEffect = getErrorFromResponse(error, payload.form);

    if (!payload.isSilent) {
      yield all(errorEffect);
    }

    yield put(failureAction(action, {
      ...action.payload,
      error,
    }));
  }
}

function* removeData(action) {
  const isLocalItem = isLocalKey(action.payload.key);

  try {
    if (isLocalItem || action.payload.isLocal) {
      yield put(successAction(action, {
        ...action.payload,
      }));
    } else {
      const response = yield call(api.del, action.payload);

      yield put(successAction(action, {
        ...action.payload,
        response,
      }));
    }
  } catch (error) {
    const exceptionType = R.pathOr(null, ['response', 'data', 'exception', 'type'], error)

    // При удалении оказалось, что запись уже была удалена
    if (exceptionType === 'NullReferenceException') {
      yield put(successAction(action, {
        ...action.payload,
        response: error.response,
      }));
      return;
    }

    const errorEffect = getErrorFromResponse(error, action.payload.form);
    yield all(errorEffect);
    yield put(failureAction(action, {
      ...action.payload,
      error,
    }));
  }
}

function* removeWithUndoData(action) {
  try {
    yield call(api.post, {
      key: action.payload.key,
      button: 'custom.delete_with_undo',
    });

    yield put(setNotification({
      type: 'global',
      isRemove: {
        duration: 15,
        action: {
          type: action.type.replace(/__.+/, '__UNDO_REMOVE'),
          payload: {
            tableKey: action.payload.tableKey,
            key: action.payload.key,
          },
        },
      },
    }));

    yield put(successAction(action, {
      ...action.payload,
    }));
  } catch (error) {
    const exceptionType = R.pathOr(null, ['response', 'data', 'exception', 'type'], error)
    // При удалении оказалось, что запись уже была удалена
    if (exceptionType === 'NullReferenceException') {
      yield put(successAction(action, {
        ...action.payload,
        response: error.response,
      }));
      return;
    }

    const errorEffect = getErrorFromResponse(error, action.payload.form);
    yield all(errorEffect);
    yield put(failureAction(action, {
      ...action.payload,
      error,
    }));
  }
}

function* undoRemoveData(action) {
  yield put(setNotification({
    type: 'global',
    isRemove: false,
  }));

  try {
    yield call(api.request.post, `/${action.payload.tableKey}/json/v2`, {
      parameters: {
        key: action.payload.key,
      },
    }, {
      headers: {
        Function: 'undoDelete',
      },
    });
  } catch (error) {
    const errorEffect = getErrorFromResponse(error, action.payload.form);
    yield all(errorEffect);
    yield put(failureAction(action, {
      ...action.payload,
      error,
    }));
  }
}

export default function* saga() {
  yield all([
    takeEvery(action => R.endsWith('__FETCH', action.type), fetchData),
    takeEvery(action => R.endsWith('__SAVE', action.type), saveData),
    takeEvery(action => R.endsWith('__REMOVE', action.type), removeData),
    takeEvery(action => R.endsWith('__REMOVE_WITH_UNDO', action.type), removeWithUndoData),
    takeEvery(action => R.endsWith('__UNDO_REMOVE', action.type), undoRemoveData),
  ]);
}
