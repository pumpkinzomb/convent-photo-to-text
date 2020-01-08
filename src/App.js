import React, { Component } from "react";
import "./App.scss";
import Tesseract from "tesseract.js";
import Clipboard from "clipboard";
import Select from "react-select";
import languages from "./Tesseract/language.js";
export default class App extends Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();
    this.textCopyBtn = React.createRef();
    this.state = {
      text: "",
      image: "",
      selectedLanguage: languages[1]
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.readImage = this.readImage.bind(this);
    this.handleInputText = this.handleInputText.bind(this);
  }
  async readImage(img, lang) {
    const {
      data: { text }
    } = await Tesseract.recognize(img, lang);
    console.log("read success");
    console.log(text);
    this.setState({
      text,
      selectedLanguage: this.selectedLanguage,
      image: img
    });
  }
  handleInputText(e) {
    this.setState({
      text: e.target.value
    });
  }
  handleChange(e) {
    const image = e.target.files[0];
    if (image) {
      const imgUrl = URL.createObjectURL(image);
      this.readImage(imgUrl);
    }
  }
  handleChangeSelect(selected, event) {
    console.log(selected, event);
    this.setState({
      text: this.state.text,
      image: this.state.image,
      selectedLanguage: selected
    });
    if (!this.state.image || this.state.selectedLanguage === selected) {
      return;
    }
    this.readImage(this.state.image, selected.value);
  }
  componentDidMount() {
    const button = this.textCopyBtn.current;
    const input = this.textArea.current;
    this.clipboard = new Clipboard(button, {
      target: () => input
    });
    this.clipboard.on("success", function(e) {
      // console.info("Action:", e.action);
      // console.info("Text:", e.text);
      // console.info("Trigger:", e.trigger);
      e.clearSelection();
    });
    this.clipboard.on("error", function(e) {
      // console.error('Action:', e.action);
      // console.error('Trigger:', e.trigger);
    });
  }
  componentWillUnmount() {
    this.clipboard.destroy();
  }
  render() {
    const { text, image, selectedLanguage } = this.state;
    return (
      <div className="App">
        <h1>Text Converter</h1>
        <Select
          classNamePrefix="select"
          options={languages}
          value={selectedLanguage}
          isSearchable={false}
          onChange={this.handleChangeSelect}
          autoFocus={true}
        />
        <div className="camera-section">
          <input type="file" id="camera" name="camera" capture="camera" accept="image/*" onChange={this.handleChange} />
        </div>
        <div className="text-section">
          <div className="image">
            <img src={image} crossOrigin="anonymous" alt={image}></img>
          </div>
          <div className="text">
            <textarea placeholder="" value={text} ref={this.textArea} onChange={this.handleInputText}></textarea>
          </div>
          <button type="button" ref={this.textCopyBtn}>
            복사하기
          </button>
        </div>
      </div>
    );
  }
}
