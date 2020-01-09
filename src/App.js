import React, { Component } from "react";
import "./App.scss";
import Tesseract from "tesseract.js";
import Clipboard from "clipboard";
import Select from "react-select";
import languages from "./Tesseract/language.js";
import update from "react-addons-update";
import ReactLoading from "react-loading";
// import loadImage from "blueimp-load-image";
export default class App extends Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();
    this.textCopyBtn = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.handleInputText = this.handleInputText.bind(this);
    this.state = {
      text: "",
      image: "",
      isLoading: false,
      selectedLanguage: languages[0]
    };
  }
  readImage = async (img, lang) => {
    const {
      data: { text }
    } = await Tesseract.recognize(img, lang);
    console.log("read success", text);
    const updateState = update(this.state, {
      text: { $set: text },
      isLoading: { $set: false }
    });
    this.setState(updateState);
  };
  handleInputText(e) {
    const updateState = update(this.state, {
      text: { $set: e.target.value }
    });
    this.setState(updateState);
  }
  handleChange(e) {
    const image = e.target.files[0];
    // const test = loadImage(
    //   image,
    //   img => {
    //     document.body.appendChild(img);
    //   },
    //   {
    //     maxWidth: 600,
    //     orientation: true
    //   }
    // );
    // console.log(test.src);
    // this.readImage(test, "eng");
    // console.log(testSrc);
    // const imgUrl = URL.createObjectURL(test);

    if (image) {
      const imgUrl = URL.createObjectURL(image);
      const updateState = update(this.state, {
        image: { $set: imgUrl },
        isLoading: { $set: true }
      });
      this.setState(updateState);
      this.readImage(imgUrl, this.state.selectedLanguage.value);
    }
  }
  handleChangeSelect(selected, event) {
    if (!this.state.image) {
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
  handleReadAgain = () => {
    console.log("read");
    if (!this.state.image) {
      return;
    }
    const updateState = update(this.state, {
      isLoading: {
        $set: true
      }
    });
    this.setState(updateState);
    const { image, selectedLanguage } = this.state;
    this.readImage(image, selectedLanguage.value);
  };
  handleReset = () => {
    const updateState = update(this.state, {
      text: { $set: "" },
      image: { $set: "" }
    });
    this.setState(updateState);
  };
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
        <h1>Text:ure</h1>
        <p className="description">Simple Application which extract text in photograph.</p>
        <Select
          classNamePrefix="select"
          options={languages}
          value={selectedLanguage}
          isSearchable={false}
          onChange={this.handleChangeSelect}
          autoFocus={true}
        />
        <div className="camera-section">
          <input type="file" accept="image/*" onChange={this.handleChange} />
        </div>
        <div className="text-section">
          <div className="image">
            {isLoading ? (
              <div className="loading">
                <span>Now Converting...</span>
                <ReactLoading type="bars" color="#000000" />
              </div>
            ) : (
              ""
            )}
            {image ? <img src={image} crossOrigin="anonymous" alt={image} /> : ""}
          </div>
          <div className="text">
            <textarea placeholder="" value={text} ref={this.textArea} onChange={this.handleInputText}></textarea>
          </div>
          <div className="btns">
            <button type="button" ref={this.textCopyBtn}>
              복사하기
            </button>
            <button type="button" onClick={this.handleReadAgain}>
              재인식
            </button>
            <button type="button" onClick={this.handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }
}
