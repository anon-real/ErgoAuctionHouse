import React, {Fragment} from 'react';
import {Button, FormText, Input, Label, Modal, ModalBody, ModalFooter} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import BeatLoader from "react-spinners/BeatLoader";
import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
import {sha256} from "js-sha256";
import {Form} from "react-bootstrap";

import Dropzone from 'react-dropzone'
import ModalHeader from "react-bootstrap/lib/ModalHeader";
import {uploadArtwork} from "../../auction/helpers";
import {artworkTypes} from "../../auction/consts";
import {issueArtwork} from "../../auction/yoroiUtils";
import {css} from "@emotion/core";

const ImageAudioVideo = () => {
    const getUploadParams = ({meta}) => {
        const url = 'https://httpbin.org/post'
        return {url, meta: {fileUrl: `${url}/${encodeURIComponent(meta.name)}`}}
    }

    const handleChangeStatus = ({meta}, status) => {
        console.log(status, meta)
    }

    const handleSubmit = (files, allFiles) => {
        console.log(files.map(f => f.meta))
        allFiles.forEach(f => f.remove())
    }

    return (
        <Dropzone
            getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
        >

        </Dropzone>
    )
}

export default class NewArtwork extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            checksum: null,
            description: "",
            name: "",
        };

        this.issue = this.issue.bind(this);
        this.okToIssue = this.okToIssue.bind(this);
        this.hashFile = this.hashFile.bind(this);
        this.setFileChecksum = this.setFileChecksum.bind(this);
    }

    okToIssue() {
        return !this.state.loading && this.state.checksum !== null && this.state.name.length
    }

    async issue() {
        this.setState({loading: true})
        const type = artworkTypes[this.getFileType(this.state.file)]
        const cid = await uploadArtwork(this.state.file)
        let cover = null
        if (this.getFileType(this.state.file) === 'audio' && this.state.audioCover)
            cover = await uploadArtwork(this.state.audioCover)
        await issueArtwork(this.state.name, this.state.description, this.state.checksum, type, cid, cover)
        this.setState({loading: false})
        this.props.close()
    }

    getFileType(file) {

        if (file.type.match('image.*'))
            return 'image';

        if (file.type.match('video.*'))
            return 'video';

        if (file.type.match('audio.*'))
            return 'audio';

        return 'other';
    }

    setFileChecksum(checksum, file) {
        this.setState({loading: false, checksum: checksum, file: file})
    }

    hashFile(file) {
        this.setState({loading: true})
        let reader = new FileReader()
        let setCS = this.setFileChecksum
        reader.onload = function (e) {
            let checksum = sha256(e.target.result)
            setCS(checksum, file)
        }
        reader.readAsArrayBuffer(file)
    }

    render() {
        return (
            <Fragment>
                <Modal
                    size="md"
                    isOpen={this.props.isOpen}
                    toggle={() => this.props.close()}
                >
                    <ModalHeader toggle={this.props.close}>
                        <span className="fsize-1 text-muted">
                        Creating new item
                    </span>
                    </ModalHeader>
                    <ModalBody>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <fieldset disabled={this.state.loading}>
                                <Form>
                                    <FormGroup>
                                        <Label for="tokenName">Select the Artwork *</Label>
                                        <InputGroup>
                                            {/*<Basic/>*/}
                                            {/*<ImageAudioVideo/>*/}
                                            <Dropzone onDrop={(f) => {
                                                this.hashFile(f[0])
                                            }}
                                                      accept="image/*,audio/*,video/*"
                                                      multiple={false}
                                                      inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                                                      styles={{
                                                          dropzoneReject: {borderColor: 'red', backgroundColor: '#DAA'},
                                                          inputLabel: (files, extra) => (extra.reject ? {color: 'red'} : {}),
                                                      }}
                                            >
                                                {({getRootProps, getInputProps}) => (
                                                    <div {...getRootProps({className: "dropzone"})}>
                                                        <input {...getInputProps()} />
                                                        <p>drag & drop file or browse the artwrok on your device</p>
                                                    </div>
                                                )}
                                            </Dropzone>
                                        </InputGroup>
                                        <FormText>{this.state.file ? this.state.file.name : 'select your artwork file'}
                                            <b>{this.state.file ? ' - ' + this.getFileType(this.state.file) + ' artwork' : ''}</b>
                                        </FormText>

                                    </FormGroup>
                                    {this.state.file && this.getFileType(this.state.file) === 'audio' && <FormGroup>
                                        <InputGroup>
                                            <Dropzone onDrop={(f) => {
                                                this.setState({audioCover: f[0]})
                                            }}
                                                      accept="image/*"
                                                      multiple={false}
                                            >
                                                {({getRootProps, getInputProps}) => (
                                                    <div {...getRootProps({className: "dropzone"})}>
                                                        <input {...getInputProps()} />
                                                        <p>drag & drop file or browse the audio cover on your device</p>
                                                    </div>
                                                )}
                                            </Dropzone>
                                        </InputGroup>
                                        <FormText>{this.state.audioCover ? this.state.audioCover.name : 'select the audio image cover - this is optional'} </FormText>

                                    </FormGroup>}
                                    <FormGroup>
                                        <Label for="tokenName">Name*</Label>
                                        <InputGroup>
                                            <Input
                                                value={this.state.name}
                                                onChange={(e) => {
                                                    this.setState({name: e.target.value})
                                                }}
                                                id="tokenName"
                                            />
                                        </InputGroup>
                                        <FormText>artwork name</FormText>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="description">Description</Label>
                                        <InputGroup>
                                            <Input
                                                type="textarea"
                                                value={this.state.description}
                                                onChange={(e) => {
                                                    this.setState({description: e.target.value})
                                                }}
                                                id="description"
                                            />
                                        </InputGroup>
                                        <FormText>description of your artwork; anything to represent it to
                                            others</FormText>
                                    </FormGroup>
                                </Form>
                            </fieldset>

                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <BeatLoader
                            size={8}
                            color={'#0b473e'}
                            loading={this.state.loading}
                        />

                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            // onClick={this.closeModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={!this.okToIssue()}
                            // disabled={}
                            onClick={this.issue}
                        >
                            Issue
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
