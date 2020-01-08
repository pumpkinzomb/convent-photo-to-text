import React, { Component } from "react";
import "./App.scss";
import Tesseract from "tesseract.js";
import Clipboard from "clipboard";
import Select from "react-select";
import languages from "./Tesseract/language.js";
import update from "react-addons-update";
import ReactLoading from "react-loading";
import loadImage from "blueimp-load-image";
export default class App extends Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();
    this.textCopyBtn = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.readImage = this.readImage.bind(this);
    this.handleInputText = this.handleInputText.bind(this);
    this.state = {
      text: "",
      image: "",
      isLoading: false,
      selectedLanguage: languages[1]
    };
  }
  async readImage(img, lang) {
    const {
      data: { text }
    } = await Tesseract.recognize(img, lang);
    console.log("read success", text);
    const updateState = update(this.state, {
      text: { $set: text },
      isLoading: { $set: false }
    });
    this.setState(updateState);
  }
  handleInputText(e) {
    const updateState = update(this.state, {
      text: { $set: e.target.value }
    });
    this.setState(updateState);
  }
  handleChange(e) {
    const image = e.target.files[0];
    const test = loadImage(
      image,
      img => {
        document.body.appendChild(img);
      },
      {
        orientation: true
      }
    );
    // const imgUrl = URL.createObjectURL(test);
    // this.readImage(imgUrl, "kor");
    // if (image) {
    //   const imgUrl = URL.createObjectURL(image);
    //   const updateState = update(this.state, {
    //     image: { $set: imgUrl },
    //     isLoading: { $set: true }
    //   });
    //   this.setState(updateState);
    //   this.readImage(imgUrl);
    // } else {
    //   const updateState = update(this.state, {
    //     image: { $set: "" }
    //   });
    //   this.setState(updateState);
    // }
  }
  handleChangeSelect(selected, event) {
    if (!this.state.image || this.state.selectedLanguage === selected) {
      const updateState = update(this.state, {
        selectedLanguage: {
          $set: selected
        }
      });
      this.setState(updateState);
    } else {
      const updateState = update(this.state, {
        selectedLanguage: {
          $set: selected
        },
        isLoading: {
          $set: true
        }
      });
      this.setState(updateState);
      this.readImage(this.state.image, selected.value);
    }
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
    const { text, image, selectedLanguage, isLoading } = this.state;
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
          <input
            type="file"
            id="camera"
            name="camera"
            capture="camera"
            accept="image/*"
            onChange={this.handleChange}
          />
        </div>
        <div className="text-section">
          <div className="image">
            {isLoading ? (
              <div className="loading">
                <ReactLoading type="bars" color="#000000" />
              </div>
            ) : (
              ""
            )}
            <img src={image} crossOrigin="anonymous" alt={image}></img>
          </div>
          <div className="text">
            <textarea
              placeholder=""
              value={text}
              ref={this.textArea}
              onChange={this.handleInputText}
            ></textarea>
          </div>
          <button type="button" ref={this.textCopyBtn}>
            복사하기
          </button>
        </div>
      </div>
    );
  }
}
