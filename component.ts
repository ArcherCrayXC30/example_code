import React, { FunctionComponent, memo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { match } from 'react-router'
import { Location } from 'history'

import { UserRole, hasRole } from '../../utils/userRoles'

import styles from './styles.scss'

export interface MenuProps {
  logout: () => Promise<boolean>
  userId: number
  userName: string
  userRoles: UserRole
}

const isActiveLink = (matched, location: Location): boolean =>
  /^\/([\d]+|new)?$/.test(location.pathname)

const Menu: FunctionComponent<MenuProps> = ({ logout, userId, userName, userRoles }) => (
  <div className={styles.menuContainer}>
    <nav className={styles.navigation}>
      <ul>
        <li>
          <NavLink
            activeClassName={styles.active}
            className={styles.navigationLink}
            isActive={isActiveLink}
            to="/"
          >
            Размещение облигаций
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName={styles.active} className={styles.navigationLink} to="/ipo">
            IPO
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName={styles.active} className={styles.navigationLink} to="/registry">
            Реестр АСМ
          </NavLink>
        </li>
        <li>
          <NavLink
            activeClassName={styles.active}
            className={styles.navigationLink}
            to="/catalogues"
          >
            Справочники
          </NavLink>
        </li>
        {hasRole(userRoles, UserRole.UserEditor) ? (
          <li>
            <NavLink activeClassName={styles.active} className={styles.navigationLink} to="/users">
              Пользователи
            </NavLink>
          </li>
        ) : null}
        {hasRole(userRoles, UserRole.Editor) ? (
          <li>
            <NavLink activeClassName={styles.active} className={styles.navigationLink} to="/logs">
              Логи
            </NavLink>
          </li>
        ) : null}
      </ul>
    </nav>
    <div className={styles.currentUser}>
      {userName}
      <div className={styles.controls}>
        <Link to={`/users/${userId}`}>Редактирование профиля</Link>
        <button onClick={logout}>Выйти</button>
      </div>
    </div>
  </div>
)

export default memo(Menu)
