import React, { useEffect, useReducer } from 'react';
import TerraApplication from 'terra-application';
import classNames from 'classnames/bind';
import Canvas from '../canvas';
import Catalog from '../catalog';
import Editor from '../editor';
import reducer, { initialState } from '../reducer';
import { ApplicationStateProvider } from '../context';
import styles from './Application.module.scss';

const cx = classNames.bind(styles);

const Application = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    function handleMessage(event) {
      const { data } = event;
      const { message } = data;

      switch (message) {
        case 'SANDBOX.DISPATCH.APPEND':
          dispatch({ type: 'APPEND', component: data.component });
          break;
        case 'SANDBOX.DISPATCH.REPLACE':
          dispatch({ type: 'REPLACE', id: data.id, replacement: data.replacement });
          break;
        case 'SANDBOX.STATE.REQUEST':
          event.source.postMessage({ message: 'SANDBOX.STATE.UPDATE', state });
          break;
        case 'SANDBOX.DISPATCH.SELECT':
          dispatch({ type: 'SELECT', id: data.id });
          break;
        default:
          console.log(`WARNING: Unsupported message. ${message}`);
      }
    }

    window.addEventListener('message', handleMessage);

    // Communicate state updates to the iframe.
    const sandbox = document.getElementById('sandbox');

    if (sandbox) {
      sandbox.contentWindow.postMessage({ message: 'SANDBOX.STATE.UPDATE', state });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [state]);

  return (
    <TerraApplication>
      <ApplicationStateProvider state={state} dispatch={dispatch}>
        <div className={(cx('application'))}>
          <Catalog />
          <Canvas />
          <Editor />
        </div>
      </ApplicationStateProvider>
    </TerraApplication>
  );
};

export default Application;