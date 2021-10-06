import React, {Fragment} from 'react';
import {Button, FormText, Input, Label, Modal, ModalBody, ModalFooter} from "reactstrap";
import BeatLoader from "react-spinners/BeatLoader";
import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
import {sha256} from "js-sha256";
import {Form} from "react-bootstrap";

import Dropzone from 'react-dropzone'
import ModalHeader from "react-bootstrap/lib/ModalHeader";
import {uploadArtwork} from "../../auction/helpers";
import {artworkTypes} from "../../auction/consts";
import {issueArtwork} from "../../auction/issueArtworkAssm";
import { Range } from 'react-range';

export default class NewArtwork extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            checksum: null,
            description: "",
            name: "",
            quantity: 1,
            values: [2]
        };

        this.issue = this.issue.bind(this);
        this.okToIssue = this.okToIssue.bind(this);
        this.hashFile = this.hashFile.bind(this);
        this.setFileChecksum = this.setFileChecksum.bind(this);
    }

    okToIssue() {
        return !this.state.loading && this.state.checksum !== null && this.state.name.length && parseInt(this.state.quantity) >= 1
    }

    async issue() {
        this.setState({loading: true})
        const type = artworkTypes[this.getFileType(this.state.file)]
        const cid = await uploadArtwork(this.state.file)
        let cover = null
        if (this.getFileType(this.state.file) === 'audio' && this.state.audioCover)
            cover = await uploadArtwork(this.state.audioCover)
        await issueArtwork(this.state.name, this.state.description, parseInt(this.state.quantity), this.state.values[0],
            this.state.checksum, type, cid, cover, this.props.sendModal)
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
                                        <Label for="tokenName">Quantity*</Label>
                                        <InputGroup>
                                            <Input
                                                type="number"
                                                value={this.state.quantity}
                                                onChange={(e) => {
                                                    this.setState({quantity: e.target.value})
                                                }}
                                                id="quantity"
                                            />
                                        </InputGroup>
                                        <FormText>Issuance quantity
                                            {parseInt(this.state.quantity) > 1 &&
                                            <b>{' - '}No longer considered to be NFT! Set to one for NFT.</b>}
                                        </FormText>
                                    </FormGroup>
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

                                    <FormGroup>
                                        <Label className="mb-3" for="tokenName">Royalty Percentage*</Label>
                                        <InputGroup className="mb-2">
                                            <Range
                                                step={1}
                                                min={0}
                                                max={10}
                                                values={this.state.values}
                                                onChange={(values) => this.setState({ values })}
                                                renderTrack={({ props, children }) => (
                                                    <div
                                                        {...props}
                                                        style={{
                                                            ...props.style,
                                                            height: '4px',
                                                            width: '100%',
                                                            backgroundColor: '#ccc'
                                                        }}
                                                    >
                                                        {children}
                                                    </div>
                                                )}
                                                renderThumb={({ props }) => (
                                                    <div
                                                        {...props}
                                                        style={{
                                                            ...props.style,
                                                            height: '15px',
                                                            width: '25px',
                                                            backgroundColor: '#999'
                                                        }}
                                                    />
                                                )}
                                            />
                                        </InputGroup>
                                        <FormText>You will receive {this.state.values[0]}% share on secondary sales</FormText>
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
                            onClick={() => this.props.close()}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={!this.okToIssue()}
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
