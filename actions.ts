import axios from 'axios'
import { ActionCreator, Dispatch } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import nanoid from 'nanoid'
import { IAppState } from '../types/AppState'
import {
  IAdminDictionarySuccessAction,
  IArticleAdditional,
  IArticleAdditionalModel,
  ICategory,
  IDictionaryFailureAction,
  IDictionaryRequestingAction,
  IDictionarySuccessAction,
  IDictionaryUpdFailureAction,
  IDictionaryUpdRequestingAction,
  IDictionaryUpdSuccessAction,
  IEducationDictionarySuccessAction,
  IFiguresDictionarySuccessAction,
  INewsDictionarySuccessAction,
  IBriefcaseType,
  IBriefcasesDictionarySuccessAction,
  IGlossaryDictionarySuccessAction
} from '../types/Articles'
import { IFigure } from '../types/Figure'
import { ITag } from '../types/Tags'
import { INoticeSetAction } from '../types/Notice'
import { IGroups } from '../types/GlossaryInfo'
import { IGlossaryGroupsModel } from '../api/models/glossGroups'

export interface IChangeEducationTagsParams {
  createEducationTags: Array<Partial<IArticleAdditionalModel>>
  deleteEducationTags: number[]
  updateEducationTags: Array<Partial<IArticleAdditionalModel>>
}

export interface IChangeNewsTagsParams {
  createNewsTags: Array<Partial<IArticleAdditionalModel>>
  deleteNewsTags: number[]
  updateNewsTags: Array<Partial<IArticleAdditionalModel>>
}

export interface IChangeGlossaryParams {
  createGlossary: Array<Partial<IGlossaryGroupsModel>>
  deleteGlossary: number[]
  updateGlossary: Array<Partial<IGlossaryGroupsModel>>
}

export interface IChangeFiguresParams {
  createFigures: Array<Partial<IArticleAdditionalModel>>
  deleteFigures: number[]
  updateFigures: Array<Partial<IArticleAdditionalModel>>
}

export interface IChangeBriefcasesParams {
  createBriefcases: Array<Partial<IBriefcaseType>>
  deleteBriefcases: number[]
  updateBriefcases: Array<Partial<IBriefcaseType>>
}

const shouldFetchDictionary = (state: IAppState): boolean => {
  if (state.dictionary.readyStatus === 'SUCCESS') {
    return false
  }

  return true
}

export const fetchDictionaryIfNeeded = () => (
  dispatch: ActionCreator<ThunkDispatch<IAppState, void, IDictionarySuccessAction | IDictionaryFailureAction>>,
  getState: () => IAppState
) => {
  if (shouldFetchDictionary(getState())) {
    return dispatch(fetchDictionary())
  }

  return null
}

export const updateCategory: ActionCreator<ThunkAction<
  Promise<IDictionaryUpdRequestingAction | IDictionaryUpdFailureAction | IDictionaryUpdSuccessAction>,
  IAppState,
  IArticleAdditional,
  IDictionaryUpdFailureAction | IDictionaryUpdSuccessAction
>> = (category: IArticleAdditional) => async (dispatch: Dispatch) => {
  const categoryUpdRequest: IDictionaryUpdRequestingAction = {
    type: 'DICTIONARY_UPDATE_REQUESTING'
  }

  dispatch(categoryUpdRequest)

  try {
    const {
      data
    }: {
      data: { categories: IArticleAdditional[]; types: IArticleAdditional[] }
    } = await axios.patch(`/api/dictionary/admin/category/${category.id}`, category)
    const categotyUpdSuccess: IDictionaryUpdSuccessAction = {
      adminDictionaries: data,
      type: 'DICTIONARY_UPDATE_SUCCESS'
    }

    return dispatch(categotyUpdSuccess)
  } catch (err) {
    const categoryUpdFailure: IDictionaryUpdFailureAction = {
      err,
      type: 'DICTIONARY_UPDATE_FAILURE'
    }

    return dispatch(categoryUpdFailure)
  }
}

export const updateType: ActionCreator<ThunkAction<
  Promise<IDictionaryUpdRequestingAction | IDictionaryUpdFailureAction | IDictionaryUpdSuccessAction>,
  IAppState,
  IArticleAdditional,
  IDictionaryUpdFailureAction | IDictionaryUpdSuccessAction
>> = (type: IArticleAdditional) => async (dispatch: Dispatch) => {
  const categoryUpdRequest: IDictionaryUpdRequestingAction = {
    type: 'DICTIONARY_UPDATE_REQUESTING'
  }

  dispatch(categoryUpdRequest)

  try {
    const {
      data
    }: {
      data: { categories: IArticleAdditional[]; types: IArticleAdditional[] }
    } = await axios.patch(`/api/dictionary/admin/types/${type.id}`, type)
    const categotyUpdSuccess: IDictionaryUpdSuccessAction = {
      adminDictionaries: data,
      type: 'DICTIONARY_UPDATE_SUCCESS'
    }

    return dispatch(categotyUpdSuccess)
  } catch (err) {
    const categoryUpdFailure: IDictionaryUpdFailureAction = {
      err,
      type: 'DICTIONARY_UPDATE_FAILURE'
    }

    return dispatch(categoryUpdFailure)
  }
}

export const fetchDictionary: ActionCreator<ThunkAction<
  Promise<
    | IAdminDictionarySuccessAction
    | IEducationDictionarySuccessAction
    | INewsDictionarySuccessAction
    | IFiguresDictionarySuccessAction
    | IBriefcasesDictionarySuccessAction
    | IDictionarySuccessAction
    | IDictionaryFailureAction
    | IGlossaryDictionarySuccessAction
  >,
  IAppState,
  undefined | 'admin' | 'education' | 'figures' | 'news' | 'briefcases' | 'glossary',
  IDictionarySuccessAction | IDictionaryFailureAction
>> = (
  param: undefined | 'admin' | 'education' | 'figures' | 'news' | 'briefcases' | 'glossary',
  allTags?: boolean
) => async (dispatch: Dispatch) => {
  const dictionaryRequest: IDictionaryRequestingAction = {
    type: 'DICTIONARY_REQUESTING'
  }

  dispatch(dictionaryRequest)

  try {
    if (param === 'admin') {
      const {
        data: admData
      }: {
        data: { categories: IArticleAdditional[]; types: IArticleAdditional[] }
      } = await axios.get('/api/dictionary/admin')
      const dictionaryAdmSuccess: IAdminDictionarySuccessAction = {
        adminDictionaries: admData,
        type: 'ADMIN_DICTIONARY_SUCCESS'
      }

      return dispatch(dictionaryAdmSuccess)
    }

    if (param === 'education') {
      const {
        data: educationData
      }: {
        data: { educationTagsList: IArticleAdditional[] }
      } = await axios.get('/api/dictionary/education')
      const dictionaryEducationSuccess: IEducationDictionarySuccessAction = {
        educationTagsList: educationData.educationTagsList,
        type: 'EDUCATION_DICTIONARY_SUCCESS'
      }

      return dispatch(dictionaryEducationSuccess)
    }

    if (param === 'news') {
      const {
        data: newsData
      }: {
        data: { newsTagsList: IArticleAdditional[] }
      } = await axios.get('/api/dictionary/news')
      const dictionaryNewsSuccess: INewsDictionarySuccessAction = {
        newsTagsList: newsData.newsTagsList,
        type: 'NEWS_DICTIONARY_SUCCESS'
      }

      return dispatch(dictionaryNewsSuccess)
    }

    if (param === 'figures') {
      const {
        data: figuresData
      }: {
        data: { figuresList: IFigure[] }
      } = await axios.get('/api/dictionary/figures')
      const dictionaryFiguresSuccess: IFiguresDictionarySuccessAction = {
        figuresList: figuresData.figuresList,
        type: 'FIGURES_DICTIONARY_SUCCESS'
      }

      return dispatch(dictionaryFiguresSuccess)
    }

    if (param === 'briefcases') {
      const {
        data: briefcasesData
      }: {
        data: { briefcasesList: IBriefcaseType[] }
      } = await axios.get('/api/dictionary/briefcases')
      const dictionaryBriefcasesSuccess: IBriefcasesDictionarySuccessAction = {
        briefcasesList: briefcasesData.briefcasesList,
        type: 'BRIEFCASES_DICTIONARY_SUCCESS'
      }

      return dispatch(dictionaryBriefcasesSuccess)
    }

    if (param === 'glossary') {
      const {
        data: glossaryData
      }: {
        data: { glossaryGroups: IGroups[] }
      } = await axios.get('/api/dictionary/glossary')
      const dictionaryGlossarySuccess: IGlossaryDictionarySuccessAction = {
        glossaryGroups: glossaryData.glossaryGroups,
        type: 'GLOSSARY_DICTIONARY_SUCCESS'
      }

      return dispatch(dictionaryGlossarySuccess)
    }

    const {
      data
    }: {
      data: {
        briefcases: IBriefcaseType[]
        dictionary: ICategory[]
        figures: IFigure[]
        tags: ITag[]
        glossaryGroups: IGroups[]
      }
    } = await axios.get('/api/dictionary', { params: { allTags } })
    const dictionarySuccess: IDictionarySuccessAction = {
      glossaryGroups: data.glossaryGroups,
      briefcases: data.briefcases,
      categories: data.dictionary,
      figures: data.figures,
      tags: data.tags,
      type: 'DICTIONARY_SUCCESS'
    }

    return dispatch(dictionarySuccess)
  } catch (err) {
    const dictionaryFailure: IDictionaryFailureAction = {
      err,
      type: 'DICTIONARY_FAILURE'
    }

    return dispatch(dictionaryFailure)
  }
}

export const changeEducationTags: ActionCreator<ThunkAction<
  Promise<IEducationDictionarySuccessAction | IDictionaryFailureAction>,
  IAppState,
  IChangeEducationTagsParams,
  IEducationDictionarySuccessAction | IDictionaryFailureAction
>> = (params: IChangeEducationTagsParams) => async (dispatch: Dispatch) => {
  try {
    const {
      data: { educationTagsList }
    } = await axios.patch('/api/dictionary/admin/education_tags', params)
    const categotyUpdSuccess: IEducationDictionarySuccessAction = {
      educationTagsList,
      type: 'EDUCATION_DICTIONARY_SUCCESS'
    }

    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: 'Изменения сохранены',
        title: 'Успех',
        type: 'norm'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    return dispatch(categotyUpdSuccess)
  } catch (err) {
    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: `Не удалось обновить тэги`,
        title: 'Ошибка',
        type: 'err'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    const dictionaryFailure: IDictionaryFailureAction = {
      err,
      type: 'DICTIONARY_FAILURE'
    }

    return dispatch(dictionaryFailure)
  }
}

export const changeNewsTags: ActionCreator<ThunkAction<
  Promise<INewsDictionarySuccessAction | IDictionaryFailureAction>,
  IAppState,
  IChangeNewsTagsParams,
  INewsDictionarySuccessAction | IDictionaryFailureAction
>> = (params: IChangeNewsTagsParams) => async (dispatch: Dispatch) => {
  try {
    const {
      data: { newsTagsList }
    } = await axios.patch('/api/dictionary/admin/news_tags', params)
    const newsTagsUpdSuccess: INewsDictionarySuccessAction = {
      newsTagsList,
      type: 'NEWS_DICTIONARY_SUCCESS'
    }

    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: 'Изменения сохранены',
        title: 'Успех',
        type: 'norm'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    return dispatch(newsTagsUpdSuccess)
  } catch (err) {
    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: `Не удалось обновить тэги`,
        title: 'Ошибка',
        type: 'err'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    const dictionaryFailure: IDictionaryFailureAction = {
      err,
      type: 'DICTIONARY_FAILURE'
    }

    return dispatch(dictionaryFailure)
  }
}

export const changeGlossary: ActionCreator<ThunkAction<
  Promise<IGlossaryDictionarySuccessAction | IDictionaryFailureAction>,
  IAppState,
  IChangeGlossaryParams,
  IGlossaryDictionarySuccessAction | IDictionaryFailureAction
>> = (params: IChangeGlossaryParams) => async (dispatch: Dispatch) => {
  try {
    const {
      data: { glossaryGroups }
    } = await axios.patch('/api/dictionary/admin/glossaries_groups', params)
    const newsTagsUpdSuccess: IGlossaryDictionarySuccessAction = {
      glossaryGroups,
      type: 'GLOSSARY_DICTIONARY_SUCCESS'
    }

    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: 'Изменения сохранены',
        title: 'Успех',
        type: 'norm'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    return dispatch(newsTagsUpdSuccess)
  } catch (err) {
    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: `Не удалось обновить словарь`,
        title: 'Ошибка',
        type: 'err'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    const dictionaryFailure: IDictionaryFailureAction = {
      err,
      type: 'DICTIONARY_FAILURE'
    }

    return dispatch(dictionaryFailure)
  }
}

export const changeFigures: ActionCreator<ThunkAction<
  Promise<IFiguresDictionarySuccessAction | IDictionaryFailureAction>,
  IAppState,
  IChangeFiguresParams,
  IFiguresDictionarySuccessAction | IDictionaryFailureAction
>> = (params: IChangeFiguresParams) => async (dispatch: Dispatch) => {
  try {
    const {
      data: { figuresList }
    } = await axios.patch('/api/dictionary/admin/figures', params)
    const categotyUpdSuccess: IFiguresDictionarySuccessAction = {
      figuresList,
      type: 'FIGURES_DICTIONARY_SUCCESS'
    }

    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: 'Изменения сохранены',
        title: 'Успех',
        type: 'norm'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    return dispatch(categotyUpdSuccess)
  } catch (err) {
    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: `Не удалось обновить фигуры`,
        title: 'Ошибка',
        type: 'err'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    const dictionaryFailure: IDictionaryFailureAction = {
      err,
      type: 'DICTIONARY_FAILURE'
    }

    return dispatch(dictionaryFailure)
  }
}

export const changeBriefcases: ActionCreator<ThunkAction<
  Promise<IBriefcasesDictionarySuccessAction | IDictionaryFailureAction>,
  IAppState,
  IChangeBriefcasesParams,
  IBriefcasesDictionarySuccessAction | IDictionaryFailureAction
>> = (params: IChangeBriefcasesParams) => async (dispatch: Dispatch) => {
  try {
    const {
      data: { briefcasesList }
    } = await axios.patch('/api/dictionary/admin/briefcases', params)
    const categotyUpdSuccess: IBriefcasesDictionarySuccessAction = {
      briefcasesList,
      type: 'BRIEFCASES_DICTIONARY_SUCCESS'
    }

    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: 'Изменения сохранены',
        title: 'Успех',
        type: 'norm'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    return dispatch(categotyUpdSuccess)
  } catch (err) {
    const noticeSet: INoticeSetAction = {
      notice: {
        id: nanoid(),
        message: `Не удалось обновить портфели`,
        title: 'Ошибка',
        type: 'err'
      },
      type: 'SET_NOTICE'
    }

    dispatch(noticeSet)

    const dictionaryFailure: IDictionaryFailureAction = {
      err,
      type: 'DICTIONARY_FAILURE'
    }

    return dispatch(dictionaryFailure)
  }
}
