import React from "react";
import { createFile } from "../models/storedFile";
import { Desktop } from "./desktop";
import { DropDownContextMenuPart, ContextMenuItem, DropdownMenuDivider } from "./dropdownContextMenu";

interface DesktopContextMenuProps {
    desktopComponentInstance: Desktop;
    onClose?: () => void;
}

export function DesktopContextMenu(props: DesktopContextMenuProps): JSX.Element {
    let [val, closeState] = React.useState(false);
    if(val) {
        props.onClose && props.onClose();
    }

    return <div onMouseLeave={ev => {props.onClose && props.onClose(); closeState(true);}}>
        <DropDownContextMenuPart menuItemClass="default_menu_item_class" menuPartClass="default_menu_class">
            <ContextMenuItem text="Create"/>
            <DropDownContextMenuPart menuItemClass="default_menu_item_class" menuPartClass="default_menu_class">
                <ContextMenuItem text="Folder" clickEv={ev => {
                    createFile({
                        name: new Date().toLocaleString(),
                        parentGroupId: 0,
                        isFoler: true
                    });
                    closeState(true);
                }}/>
                <ContextMenuItem text="Shortcut"/>
                <ContextMenuItem text="Widget"/>
            </DropDownContextMenuPart>
            <ContextMenuItem text="View"/>
            <DropDownContextMenuPart menuItemClass="default_menu_item_class" menuPartClass="default_menu_class">
                <ContextMenuItem text="Large icons"/>
                <ContextMenuItem text="Medium icons"/>
                <ContextMenuItem text="Small icons"/>
            </DropDownContextMenuPart>
            <ContextMenuItem text="Order"/>
            <DropDownContextMenuPart menuItemClass="default_menu_item_class" menuPartClass="default_menu_class">
                <ContextMenuItem text="Size"/>
                <ContextMenuItem text="Date"/>
                <ContextMenuItem text="Name"/>
            </DropDownContextMenuPart>
            <DropdownMenuDivider/>
            <ContextMenuItem text="Personalize"/>
            <ContextMenuItem text="Display settings"/>
        </DropDownContextMenuPart>
    </div>
}
