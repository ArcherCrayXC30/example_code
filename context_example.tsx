import React from 'react';
import { ERole } from "../types/auth";

const ctxt = React.createContext<ERole>(ERole['ROLE_GUEST']);

export const RoleProvider = ctxt.Provider;

export const RoleConsumer = ctxt.Consumer;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function withRole<
  P extends { roles?: ERole, rights?: ERole },
  R = Omit<P, 'roles' & 'rights'>,
  >(
  Component: React.ComponentClass<P> | React.StatelessComponent<P>
): React.SFC<P> {
  return function BoundComponent(props: P) {
    return (
      <RoleConsumer>
        {value =>
          (props.rights && props.rights <= value) || !props.rights ?
            <Component {...props} roles={value} /> :
            null
        }
      </RoleConsumer>
    );
  };
}
