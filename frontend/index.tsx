import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Desktop} from './components/desktop'


'use strict'


window.addEventListener("contextmenu", e => e.preventDefault());
let body = document.getElementsByTagName('body')[0];
let mainDiv=  document.createElement('div');
mainDiv.className = "main_div";
body.appendChild(mainDiv);
ReactDOM.render(<Desktop/>, mainDiv);









