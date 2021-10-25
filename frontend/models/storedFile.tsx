import {createEvent, createStore, createEffect, sample, Store} from 'effector'

let idCounter = 0;

export class StoredFile {
    id?: number;
    name: string;
    parentGroupId: number;
    isFoler: boolean;
}

export let fileStorage = createStore<StoredFile[]>([{
    id: 0,
    name: 'root',
    isFoler: true,
    parentGroupId: -1
}]);

export let createFile = createEvent<StoredFile>();

export let changeFile = createEvent<Pick<Partial<StoredFile>, keyof Partial<StoredFile>>>();

export let getFile = function(id: number): Readonly<StoredFile> {
    return getFileUnsafe(id);
}

function getFileUnsafe(id: number): StoredFile {
    return fileStorage.getState().find(f => f.id === id);
}

export let getFolder = function(id: number): Readonly<StoredFile> {
    let folder = getFile(id);
    if(!folder || !folder.isFoler) {
        throw 'folder not exists';
    }
    return folder;
}

export let getChilds = function(id: number): Array<Readonly<StoredFile>> {
    return fileStorage.getState().filter(f => f.parentGroupId === id);
}

export let getRoot = function(): Readonly<StoredFile> {
    return getFolder(0);
}

export let getFolderByPath = function(path: string): Readonly<StoredFile>{ 
    let file = getFileByPath(path);
    if(!file.isFoler) {
        throw 'rerr';
    }
    return file;
}

export let getFileByPath = function(path: string): Readonly<StoredFile>{
    let parts = path.split('/').filter(p => p !== ' ' && p !== '');
    if(parts[0] !== 'root') {
        throw 'err';
    }

    parts = parts.slice(1);
    if(parts.length === 0) {
        return getRoot();
    }

    let curr = getChilds(0).find(c => c.name === parts[0] && c.isFoler);
    if(!curr) {
        throw 'Err';
    }

    parts.slice(1).forEach(p => {
        curr = getChilds(curr.id).find(c => c.name === p);
        if(!curr) {
            throw 'err';
        }
    });

    return curr;
}

export let getFilePath = function(id: number) {
    let curr = getFile(id);
    if(!curr) {
        throw 'err';
    }
    let path = curr.name;

    while(true) {
        curr = getFile(curr.parentGroupId);
        if(!curr) {
            break;
        }
        path = `${curr.name}/${path}`;
    }

    return path;
}

fileStorage.on(createFile, (state, file) => {
    if(file.parentGroupId) {
        let parent = state.find(f => f.id === file.parentGroupId);
        if(!parent || !parent.isFoler || getChilds(parent.id).find(f => f.name === file.name)) {
            throw 'err on creating file';
        }
    }

    file.id = ++idCounter;

    state.push(file);

    changeFile({id: file.parentGroupId});
});

fileStorage.on(changeFile, (state, props) => {
    let file  = getFileUnsafe(props.id);

    if(!file) {
        throw 'file not exist';
    }

    if(props.name && props.name != file.name) {
        let otherChilds = getChilds(file.parentGroupId);

        if(otherChilds.some(c => c.name === props.name)) {
            throw 'there is exist file with same name';
        }

        file.name = props.name;
    }
    
    // No more props we can change
});

createFile({
    name: 'Folder 1',
    isFoler: true,
    parentGroupId: 0
});

createFile({
    name: 'Folder 2',
    isFoler: true,
    parentGroupId: 0
});

createFile({
    name: 'Folder 2 1',
    isFoler: true,
    parentGroupId: 2
});

createFile({
    name: 'Folder 2 2',
    isFoler: true,
    parentGroupId: 2
});

createFile({
    name: 'Folder 3',
    isFoler: true, 
    parentGroupId: 0
});

createFile({
    name: 'Folder 4',
    isFoler: true,
    parentGroupId: 0
});

createFile({
    name: 'Folder 5',
    isFoler: true,
    parentGroupId: 0
});