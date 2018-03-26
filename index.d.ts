import * as React from 'react';

interface componentProps {
    /**
     * onDrop: 上传回调必须
     */
    onDrop: () => void;
    /**
     * token: 上传七牛文件所必须的token 
     */
    token: string;
    /**
     * onUpload: 在上传时的回调
     */
    onUpload?: () => void;

    /**
     * supportClick: 是否支持点击事件
     */
    supportClick?: boolean;
    /**
     * uploadUrl: http和https上传到七牛的路径不同
     */
    uploadUrl?: stirng;
     /**
     * prefix: 
     */
    prefix?: string;
    /**
     * multiple: 是否可以上传多个文件
     */
    multiple?: boolean;
    /**
     * maxSize: props to check File Size before upload.example:'2Mb','30k'...
     */
    maxSize?: string;
    /**
     * style: 插件的style
     */
    style?: object;
}

interface componentState {
    isDragActive?: boolean;
}

export default class ReactQiniu extends React.Component<componentProps, componentState>{};