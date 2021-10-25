import React from "react";
import { SizedContainer } from "../interfaces/sizedContainer";
import { SizedElement } from "../interfaces/sizedElement";
import { rectContainsPoint } from "../tools/DOMTools";
import { DesktopContextMenu } from "./desktopContextMenu";
import { FolderWindow } from "./draggableWindow";
import { Folder, FolderContainer } from "./folder";
import {getChilds, changeFile, getFolder} from '../models/storedFile'
import Draggable from "react-draggable";
import { CustomDraggable, Side } from "./customDraggable";
import { ClickableIcon } from "./clickableIcon";

export function DesktopTabClock(props: any): JSX.Element {
    let [curr, setTime] = React.useState<Date>(new Date());

    setInterval(function() {
        setTime(new Date());
    }, 1000);

    return <div className="desktop_task_panel_item desktop_task_panel_clock">
        <div>{`${curr.getHours()}:${curr.getMinutes()}`}</div>
        <div>{curr.toLocaleDateString()}</div>
    </div>
}

interface DesktopState {
    contextMenuOpened: boolean;
    contextMenuX: number;
    contextMenuY: number;
}

export class Desktop extends React.PureComponent<any, DesktopState> implements FolderContainer, SizedElement, SizedContainer{
    foldersOpened: Array<{id: number, hidden: boolean, height: string, width: string, expanded: boolean, dragging: boolean, reachedBounds: Side[], placed: boolean, dragRef?: React.RefObject<CustomDraggable>}>;
    contentDivRef: React.RefObject<HTMLDivElement> = React.createRef();
    
    constructor(props: any) {
        super(props);

        this.foldersOpened = [];
        this.state = {contextMenuOpened: false, contextMenuX: -1, contextMenuY: -1};

        changeFile.watch(f => {
            if(f.id === 0) {
                this.forceUpdate();
            }
        });
    }

    checkPointInContainer(clientX: number, clientY: number): boolean {
        return rectContainsPoint(this.getBoundingClientRect(), clientX, clientY);
    }
    
    getBoundingClientRect(): DOMRect {
        return document.getElementsByTagName('body')[0].getBoundingClientRect();
    }

    openFolderAction(folderId: number): void {
        this.foldersOpened.push({id: folderId, hidden: false, height: '500px', width: '500px', expanded: false, dragging: false, reachedBounds: null, placed: false});
        this.forceUpdate();
    }

    render() {
        let folders = this.createFoldersIcons();
        let windows = this.createOpenedFoldersWindows();
        let tabbar = this.createDesktopTabbar();
        let boxes = this.createPlacmentBoxes();
        let contextMenu = this.state.contextMenuOpened
            ? <div style={{position: 'absolute', top: this.state.contextMenuY, left: this.state.contextMenuX}}><DesktopContextMenu onClose={() => {this.setState({contextMenuOpened: false})}} desktopComponentInstance={this}/></div>
            : null;

        return <div style={{position: 'relative', width: '100vw', height: '100vh'}} className="desktop"
            onMouseDown={ev => {
                if(ev.currentTarget.className === 'desktop' && ev.button === 2) {
                    let rect = this.contentDivRef.current.getBoundingClientRect();
                    let mOffsetX = ev.clientX - rect.x;
                    let mOffsetY = ev.clientY - rect.y;
                    this.setState({contextMenuOpened: true, contextMenuX: mOffsetX - 10, contextMenuY: mOffsetY - 10});
                }
            }}>
            {tabbar}
            <div className="desktop_content" ref={this.contentDivRef}>
                {folders}
                {windows}
                {contextMenu}
                {boxes}
            </div>
        </div>;   
    }

    createFoldersIcons(): JSX.Element[] {
        let mainFolderChilds = getChilds(0);

        return  mainFolderChilds.map((f, ind) => {
            let folder = <Folder 
                initialName={f.name} onDoubleClick={ev => {
                    this.openFolderAction(f.id);
                }}
                onNameChange={newName => {
                    changeFile({id: f.id, name: newName});
                }}/>

            changeFile.watch(ch => {
                if(ch.id === f.id) {
                    this.forceUpdate();
                }
            });

            return <Draggable
                key={f.id}
                bounds=".desktop_content">
                    <div className="desktop_item">
                        {folder}
                    </div>
            </Draggable>;
        });
    }

    createOpenedFoldersWindows(): JSX.Element[] {
        return this.foldersOpened.map(f => {
            if(!f.dragRef) {
                f.dragRef = React.createRef();
            }
            
            return <CustomDraggable
                key={f.id + 'w'}
                stopOthersOnDrag={true}
                ref={f.dragRef}
                drag={data => {
                    f.dragging = true;
                    f.reachedBounds = null;
                    this.forceUpdate();
                }}
                dragEnd={data => {
                    f.dragging = false;
                    if(f.reachedBounds) {
                        let side = f.reachedBounds[0];
                        switch(side) {
                            case 'b':
                                f.dragRef.current.setPos(0, this.contentDivRef.current.clientHeight / 2);
                                f.width = '100%';
                                f.height = '50%';
                                break;
                            case 't':
                                f.dragRef.current.setPos(0, 0);
                                f.width = '100%';
                                f.height = '50%';
                                break;
                            case 'r':
                                f.dragRef.current.setPos(this.contentDivRef.current.clientWidth / 2, 0);
                                f.width = '50%';
                                f.height = '100%';
                                break;
                            case 'l':
                                f.dragRef.current.setPos(0, 0);
                                f.width = '50%';
                                f.height = '100%';
                                break;
                        }
                        f.placed = true;
                    }
                    f.reachedBounds = null;
                    this.forceUpdate();
                }}
                dragStart={data => {
                    if(f.placed || f.expanded) {
                        let rect = this.contentDivRef.current.getBoundingClientRect();
                        let mOffsetX = data.mouseEvent.clientX - rect.x;
                        let mOffsetY = data.mouseEvent.clientY - rect.y;
                        let newX = (data.currentElPos.x + mOffsetX) / 2;
                        let newY = (data.currentElPos.y +  mOffsetY) / 2;
                        f.width = '50%';
                        f.height = '50%';
                        f.placed = false;
                        f.expanded = false;
                        this.forceUpdate();
                        return {x: newX, y: newY};
                    }
                }}
                onBoundReached={data => {
                    f.reachedBounds = data;
                    this.forceUpdate();
                }}
                handle=".desktop_window_tab"
                bounds={{parentEl: ".desktop_content", boundingEl: ".desktop_window"}}>
                    <div className={f.hidden ? "desktop_window_hidden" : "desktop_window_show" + (f.dragging ? " desktop_window_dragging" : " desktop_window_no_dragging")} style={{
                        width: f.expanded ? '100%' : f.width,
                        height: f.expanded ? '100%' : f.height,
                        transition: 'height ease-in 0.1s, width ease-in 0.1s, opacity linear 0.2s'
                    }}>
                        <FolderWindow
                            folderId={f.id} 
                            onHide={() => {
                                f.hidden = true;
                                this.forceUpdate();
                            }}
                            onClose={() => {
                                this.foldersOpened = this.foldersOpened.filter(v => v !== f);
                                this.forceUpdate();
                            }}
                            onExpand={() => {
                                if(f.expanded) {
                                    f.expanded = false;
                                    this.forceUpdate();
                                    return;
                                }

                                f.expanded = true;
                                f.dragRef.current.setPos(0, 0);
                                this.forceUpdate();
                            }}/>
                    </div>
            </CustomDraggable>
        });
    }

    createPlacmentBoxes(): JSX.Element[] {
        return this.foldersOpened.map(f => {
            let dragRef = React.createRef<CustomDraggable>();

            let placementBox = null;
            if(f.reachedBounds) {
                let whatsBox = f.reachedBounds[0];
                    placementBox = <div className="desktop_palcement_box" style={{
                    width: whatsBox === 'r' || whatsBox === 'l' ? '50%' : '100%',
                    height: whatsBox === 't' || whatsBox === 'b' ? '50%' : '100%',
                    bottom: whatsBox === 'b' ? 0 : null,
                    top: whatsBox === 't' ? 0 : null,
                    left: whatsBox === 'l' ? 0 : null,
                    right: whatsBox === 'r' ? 0 : null
                }}/>
            }

            return placementBox;
        });
    }

    createDesktopTabbar(): JSX.Element { 
        let windowsExpanders = this.foldersOpened
            .map(f => {
                return <div key={f.id} className="desktop_task_panel_item desktop_hidden_window_expander"
                    onClick={ev => {
                        f.hidden = !f.hidden;
                        this.forceUpdate();
                    }}>
                        <ClickableIcon text={getFolder(f.id).name} iconClass="fas fa-folder"/>
                    </div>
            });

        return <div key={0} className="desktop_task_panel">
            <button className="start_button_desktop">
                <i className="fab fa-windows windows_icon"/>
            </button>
            <div className="desktop_items">
                {windowsExpanders}
            </div>
            <DesktopTabClock/>
        </div>
    }
}