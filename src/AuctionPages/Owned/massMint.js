import React, {Fragment} from 'react';
import {Button, Col, FormText, Input, Label, Modal, ModalBody, ModalFooter, Progress, Row} from "reactstrap";
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
import {Range} from 'react-range';
import {currentHeight} from "../../auction/explorer";
import {distribute} from "../../auction/distributeAssm";

export default class MassMint extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: 0,
            loading: false,
            checksum: null,
            description: "",
            name: "",
            quantity: 1,
            values: [2],
            files: [],
            info: {}
        };

        this.info = {}

        this.issue = this.issue.bind(this);
        this.okToIssue = this.okToIssue.bind(this);
        this.hashFile = this.hashFile.bind(this);
        this.setFileChecksum = this.setFileChecksum.bind(this);
    }

    okToIssue() {
        return !this.state.loading && this.state.files.length > 0
    }

    async issue() {
        this.setState({loading: true, progress: 0})
        const height = await currentHeight()
        let addresses = []
        for (let i = 0; i < this.state.files.length; i++) {
            const file = this.state.files[i]
            const hash = file.hash
            const name = this.info[hash].name
            const description = this.info[hash].description
            const quantity = parseInt(this.info[hash].quantity)
            const royalty = parseInt(this.info[hash].royalty)
            const type = artworkTypes[this.getFileType(file)]
            const cid = await uploadArtwork(file)
            const res = await issueArtwork(height, name, description, quantity, royalty,
                hash, type, cid, null, this.props.sendModal, true)
            addresses = addresses.concat([{
                address: res.address,
                royalty: royalty
            }])
            this.setState({progress: ((i + 1) / this.state.files.length) * 100})
        }
        await distribute(addresses, this.props.sendModal)
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

    readFileAsync(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        })
    }

    async hashFile(file) {
        return sha256(await this.readFileAsync(file))
    }

    async handleFiles(fs) {
        this.setState({loading: true})
        for (let i = 0; i < fs.length; i++)
            fs[i].hash = await this.hashFile(fs[i])
        this.setState({loading: false, files: fs})
    }

    render() {
        return (
            <Fragment>
                <Modal
                    size="lg"
                    isOpen={this.props.isOpen}
                    // toggle={() => this.props.close()}
                >
                    <ModalHeader toggle={this.props.close}>
                        <span className="fsize-1 text-muted">
                        Mass minting artworks - up to 100 NFTs
                    </span>
                    </ModalHeader>
                    <ModalBody>
                        {this.state.next && <div
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                style={{
                                    height: "500px",
                                    overflow: 'scroll'
                                }}
                            >
                                {this.state.files.map(f => {
                                    return <Row
                                        className="imgDivMint"
                                    >
                                        <Col md={5}>
                                            <img
                                                style={{height: "180px", maxHeight: "150px"}}
                                                src={URL.createObjectURL(f)}/>
                                        </Col>

                                        <Col md={7}>
                                            <Row style={{margin: '5px'}}>
                                                <Col>
                                                    <FormText>
                                                        Name
                                                    </FormText>
                                                    <Input
                                                        defaultValue={this.state.name}
                                                        onChange={(e) => {
                                                            this.info[f.hash].name = e.target.value
                                                        }}
                                                    />
                                                </Col>
                                                <Col>
                                                    <FormText>
                                                        Quantity
                                                    </FormText>
                                                    <Input
                                                        type="number"
                                                        defaultValue={this.state.quantity}
                                                        onChange={(e) => {
                                                            let state = {}
                                                            this.info[f.hash].quantity = e.target.value
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row style={{margin: '5px'}}>
                                                <Col md={4}>
                                                    <FormText>
                                                        Royalty Percentage
                                                    </FormText>
                                                    <Input
                                                        defaultValue={this.state.values[0]}
                                                        onChange={(e) => {
                                                            let state = {}
                                                            this.info[f.hash].royalty = e.target.value
                                                            console.log('here')
                                                        }}
                                                    />
                                                </Col>
                                                <Col>
                                                    <FormText>
                                                        Description
                                                    </FormText>
                                                    <Input
                                                        type="textarea"
                                                        defaultValue={this.state.description}
                                                        onChange={(e) => {
                                                            this.info[f.hash].description = e.target.value
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                })}
                            </div>
                        </div>}

                        {!this.state.next && <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <fieldset disabled={this.state.loading}>
                                <Form>
                                    <FormGroup>
                                        <Label for="tokenName">Select artworks *</Label>
                                        <InputGroup>
                                            {/*<Basic/>*/}
                                            {/*<ImageAudioVideo/>*/}
                                            <Dropzone onDrop={(f) => {
                                                // this.hashFile(f[0])
                                                this.handleFiles(f)
                                            }}
                                                      accept="image/*,video/*"
                                                      multiple={true}
                                                      inputContent={(files, extra) => (extra.reject ? 'Select all artworks you want to mint at once (pictures and videos are supported)' : 'Drag Files')}
                                                      styles={{
                                                          dropzoneReject: {borderColor: 'red', backgroundColor: '#DAA'},
                                                          inputLabel: (files, extra) => (extra.reject ? {color: 'red'} : {}),
                                                      }}
                                            >
                                                {({getRootProps, getInputProps}) => (
                                                    <div {...getRootProps({className: "dropzone"})}>
                                                        <input {...getInputProps()} />
                                                        <p>drag & drop artworks or browse artworks on your device</p>
                                                    </div>
                                                )}
                                            </Dropzone>
                                        </InputGroup>
                                        <FormText>
                                            select all your artworks (pictures anb videos)
                                            - {this.state.files.length} artworks selected
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
                                        <Label for="tokenName">Default Quantity*</Label>
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
                                        <Label for="tokenName">Default Name*</Label>
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
                                        <Label for="description">Default Description</Label>
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
                                        <Label className="mb-3" for="tokenName">Default Royalty Percentage*</Label>
                                        <InputGroup className="mb-2">
                                            <Range
                                                step={1}
                                                min={0}
                                                max={10}
                                                values={this.state.values}
                                                onChange={(values) => this.setState({values})}
                                                renderTrack={({props, children}) => (
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
                                                renderThumb={({props}) => (
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
                                        <FormText>You will receive {this.state.values[0]}% share on secondary
                                            sales</FormText>
                                    </FormGroup>
                                </Form>
                            </fieldset>

                        </div>}
                        {this.state.next && <Progress color="info" value={this.state.progress}/> }
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
                        {this.state.next && <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            disabled={this.state.loading}
                            onClick={() => {
                                this.issue()
                            }}
                        >
                            Issue
                        </Button>}
                        {!this.state.next && <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={!this.okToIssue()}
                            onClick={() => {
                                let state = {next: true}
                                for (let i = 0; i < this.state.files.length; i++) {
                                    let f = this.state.files[i]
                                    this.info[f.hash] = {
                                        name: this.state.name,
                                        description: this.state.description,
                                        quantity: this.state.quantity,
                                        royalty: this.state.values[0],
                                    }
                                }
                                this.setState(state)
                            }}
                        >
                            Next
                        </Button>}
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
