import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Proptypes from 'prop-types';
import request from 'superagent-bluebird-promise';

const isFunction = function (fn) {
    var getType = {};
    return fn && getType.toString.call(fn) === '[object Function]';
}

function warning(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message)
    }
    /* eslint-enable no-console */
    try {
        throw new Error(message)
    /* eslint-disable no-empty */
    } catch (e) { }
    /* eslint-enable no-empty */
}
  

function formatMaxSize (size) {
    size=size.toString().toUpperCase();
    var 
        bsize,
        m=size.indexOf('M'),
        k=size.indexOf('K');

    if(m > -1){
        bsize = parseFloat(size.slice(0, m)) * 1024 * 1024
    }else if(k > -1){
        bsize = parseFloat(size.slice(0, k)) * 1024
    }else{
        bsize = parseFloat(size)
    }
    return Math.abs(bsize)
}

class ReactQiniu extends Component {

    constructor () {
        super();
        this.state = {
            isDragActive: false
        }
    }

    onDragLeave = () => {
        this.setState({
            isDragActive: false
        })
    }

    onDragOver = event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

        this.setState({
            isDragActive: true
        });
    }

    _onDrop = e => {
        e.preventDefault();
        const { 
            multiple, 
            onUpload, 
            maxSize, 
            onDrop,
        } = this.props;


        this.setState({
            isDragActive: false
        });

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        var maxFiles = (this.props.multiple) ? files.length : 1;

        if (onUpload) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            onUpload(files, e);
        }
        var maxSizeLimit=formatMaxSize(this.props.maxSize)
        for (var i = 0; i < maxFiles; i++) {
            if( maxSizeLimit && files[i].size > maxSizeLimit){
                warning('ERROR FILE SIZE!')
            }else{
                files[i].preview = URL.createObjectURL(files[i]);
                files[i].request = this.upload(files[i]);
                files[i].uploadPromise = files[i].request.promise();
            }
        }

        if (onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            onDrop(files, e);
        }
    }

    onClick = () => {
        const { supportClick } = this.props;
        if (supportClick === true) {
            this.open();
        }
    }

    open = () => {
        const fileInput = ReactDOM.findDOMNode(this.refs.fileInput);
        fileInput.value = null;
        fileInput.click();
    }

    upload = (file) => {
        if (!file || file.size === 0) return null;

        var key = file.preview.split('/').pop() + '.' + file.name.split('.').pop();
        const { prefix, uploadUrl, token } = this.props;
        
        if (prefix) {
            key = prefix + key;
        }

        var r = request
            .post(uploadUrl)
            .field('key', key)
            .field('token', token)
            .field('x:filename', file.name)
            .field('x:size', file.size)
            .attach('file', file, file.name)
            .set('Accept', 'application/json');
        
        if (isFunction(file.onprogress)) {
            r.on('progress', file.onprogress)
        }

        return r;
    }

    render() {

        const { style } = this.props;

        return (
            <div
                onClick={this.onClick}
                onDragLeave={this.onDragLeave}
                onDragOver={this.onDragOver}
                onDrop={this._onDrop}
                style={style}
            >
                <input 
                    ref="fileInput" 
                    type="file"
                    onChange={this._onDrop}
                    style={{display: "none"}}
                />
                {this.props.children}
            </div>
        )
    }
}

ReactQiniu.propTypes = {
    /**
     * onDrop: 上传回调必须
     */
    onDrop: Proptypes.func.isRequired,
    /**
     * token: 上传七牛文件所必须的token 
     */
    token: Proptypes.string.isRequired,
    /**
     * onUpload: 在上传时的回调
     */
    onUpload: Proptypes.func,

    /**
     * supportClick: 是否支持点击事件
     */
    supportClick: Proptypes.bool,
    /**
     * uploadUrl: http和https上传到七牛的路径不同
     */
    uploadUrl: Proptypes.string,
     /**
     * prefix: 
     */
    prefix: Proptypes.string,
    /**
     * multiple: 是否可以上传多个文件
     */
    multiple: Proptypes.bool,
    /**
     * maxSize: props to check File Size before upload.example:'2Mb','30k'...
     */
    maxSize: Proptypes.string,
    /**
     * style: 插件的style
     */
    style: Proptypes.object,
}

ReactQiniu.defaultProps = {
    uploadUrl   : window.location.protocol === 'https' ? 'https://up.qbox.me/' : 'http://upload.qiniu.com',
    multiple    : true,
    supportClick: true,
    style       : {
        width   : '100px',
        height  : '100px',
        border  : '1px solid #dddddd'
    },
    maxSize     : '10M'
}

export default ReactQiniu;