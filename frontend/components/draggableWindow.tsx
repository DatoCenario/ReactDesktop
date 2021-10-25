import React from "react";
import { Folder, FolderContainer } from "./folder";
import { Input } from "./input";
import {getChilds, StoredFile, getFolder, changeFile, getFolderByPath, getFilePath} from '../models/storedFile'

interface WindowProps {
    onClose?: () => void;
    onHide?: () => void;
    onExpand?: () => void;
}

interface FolderWindowProps extends WindowProps {
    folderId: number;
    onFolderChange?: (newFolderId: number) => void;
}

interface FolderWindowState {
    folder: StoredFile;
}

export class FolderWindow extends React.PureComponent<FolderWindowProps, FolderWindowState> implements FolderContainer {
    openHistory: number[];
    backHistory: number[];
    
    openFolderAction(folderId: number): void {
        this.openHistory.push(this.state.folder.id);
        this.setState({folder: getFolder(folderId)});
        this.props.onFolderChange && this.props.onFolderChange(folderId);
    }

    constructor(props: FolderWindowProps) {
        super(props);
        this.state = {folder: getFolder(props.folderId)};
        this.openHistory = [this.props.folderId];
        this,this.backHistory = [];
        changeFile.watch(ev => {
            if(ev.id === this.state.folder.id) {
                this.setState({folder: getFolder(ev.id)});
            }
        });
    }

    windowRef: React.RefObject<Window> = React.createRef();

    render() {
        let folderItems = getChilds(this.state.folder.id);

        let folders = folderItems.map((f) => 
            <div key={f.id}>
                <Folder
                initialName={f.name}
                onNameChange={newName => {
                    changeFile({id: f.id, name: newName});
                }}
                onDoubleClick={(ev) => this.openFolderAction(f.id)}/>
            </div>);

        let currentFolderPath = getFilePath(this.state.folder.id);
        let foldersContainer = <div className="flex_container">
            <div key={0} className="folder_tab">
                <button onClick={ev => {
                    let lastOpened = this.openHistory.pop();
                    if(lastOpened !== undefined) {
                        this.backHistory.push(this.state.folder.id);
                        this.setState({folder: getFolder(lastOpened)});
                        this.props.onFolderChange && this.props.onFolderChange(lastOpened);
                    }
                }} key={0} className="folder_arrow_button"><i className="fas fa-arrow-left"/></button>
                <button onClick={ev => {
                    let lastBack = this.backHistory.pop();
                    if(lastBack !== undefined) {
                        this.openHistory.push(this.state.folder.id);
                        this.setState({folder: getFolder(lastBack)});
                        this.props.onFolderChange && this.props.onFolderChange(lastBack);
                    }
                }} key={1} className="folder_arrow_button"><i className="fas fa-arrow-right"/></button>
                <Input key={currentFolderPath} customAreaClassName="folder_path_textarea" initialvalue={currentFolderPath} onEditEnd={newPath => {
                    try {
                        let folder = getFolderByPath(newPath);
                        this.openHistory.push(this.state.folder.id);
                        this.setState({folder: folder});
                        this.props.onFolderChange && this.props.onFolderChange(folder.id);
                    }
                    catch(err) { 
                        // no
                    }
                }}/>
            </div>
            {folders}
        </div>;

        return React.createElement(Window, {...this.props, ...{ref: this.windowRef}}, foldersContainer);
    }
}

export class Window extends React.PureComponent<WindowProps> {
    windowRef?: React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props: WindowProps) {
        super(props);
    }


    render() {
        let windowContent = <div ref={this.windowRef} className="desktop_window_content">
            {this.props.children}
        </div>

        let windowTabbar = <div className="desktop_window_tab">
            <button key={0} className="desktop_tab_button_common desktop_window_tab_hide" onClick={ev => {
                this.props.onHide && this.props.onHide();
            }}>
                <i className="fas fa-minus"/>
            </button>
            
            <button key={1} className="desktop_tab_button_common desktop_window_tab_expand" onClick={ev => {
                this.props.onExpand && this.props.onExpand();
            }}>
                <i className="fas fa-expand"/>
            </button>

            <button key={2} className="desktop_tab_button_common desktop_window_tab_close" onClick={ev => {
                this.props.onClose && this.props.onClose();
            }}>
                <i className="fas fa-times"/>
            </button>
        </div>;

        return <div className="desktop_window">
            {windowTabbar}
            {windowContent}
        </div>
    }
}