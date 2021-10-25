import React from "react";
import { ClickableIcon } from "./clickableIcon";
import { DropDownContextMenuPart, ContextMenuItem, DropdownMenuDivider } from "./dropdownContextMenu";
import { Input } from "./input";

export interface FolderContainer {
    openFolderAction(FolderId: number): void;
}

interface FolderProps {
    initialName: string,
    onNameChange?: (val: string) => void,
    onDoubleClick?: (ev: React.MouseEvent<HTMLElement>) => void
};

interface FolderState {
    nameEdit: boolean,
    name: string,
    contextMenuOpen: boolean,
    contaxtMenuOffsetX: number,
    contaxtMenuOffsetY: number
};

export class Folder extends React.PureComponent<FolderProps, FolderState> {
    constructor(props: FolderProps) {
        super(props);
        this.state = {nameEdit: false, contextMenuOpen: false, contaxtMenuOffsetX: -1, contaxtMenuOffsetY: -1, name: props.initialName};
    }

    render(): JSX.Element {
        let contextMenu = this.state.contextMenuOpen
            ? <div style={{top: this.state.contaxtMenuOffsetY, left: this.state.contaxtMenuOffsetX, zIndex: 10}} className="item_context_menu_container">
                <DropDownContextMenuPart 
                    onClose={() => {
                        this.setState({contextMenuOpen: false});
                    }}
                    menuItemClass="default_menu_item_class" menuPartClass="default_menu_class">
                    <ContextMenuItem text="Rename" clickEv={ev => {
                        this.setState({nameEdit: true});
                    }}/>
                    <DropdownMenuDivider/>
                    <ContextMenuItem text="Properties"/>
                </DropDownContextMenuPart>
            </div>
            : null;
        let nameEditor = this.state.nameEdit
            ? <Input initialvalue={this.state.name} customAreaClassName="desktop_item_name_editor" onEditEnd={newVal => {
                this.props.onNameChange && this.props.onNameChange(newVal);
                this.setState({name: newVal, nameEdit: false});
            }}/>
            : null;

        return <div onMouseDown={ev => {
            if(ev.button !== 2) {
                return;
            }

            ev.stopPropagation();
            this.setState({contextMenuOpen: true, contaxtMenuOffsetX: ev.nativeEvent.offsetX, contaxtMenuOffsetY: ev.nativeEvent.offsetY});
        }}>
            <ClickableIcon text={this.state.nameEdit ? null : this.state.name} iconClass="fas fa-folder" onDoubleClick={this.props.onDoubleClick}/>
        {nameEditor}
        {contextMenu}
        </div>
    }
}
