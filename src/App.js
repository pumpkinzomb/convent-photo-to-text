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
  handleInputText = e => {
    const updateState = update(this.state, {
      text: { $set: e.target.value }
    });
    this.setState(updateState);
  };
  handleChange = e => {
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
  };
  handleChangeSelect = (selected, event) => {
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
  };
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
        <h1>TEXT:URE</h1>
        <p className="description">
          Simple Application <br />
          which extract text in photograph.
        </p>

        <div className="camera-section">
          <label htmlFor="pickPhoto">
            <i className="material-icons">photo_camera</i>
          </label>
          <input id="pickPhoto" type="file" accept="image/*" onChange={this.handleChange} />
        </div>
        <div className="select-section">
          <label htmlFor="select">Select Language.</label>
          <Select
            id="select"
            classNamePrefix="select"
            options={languages}
            value={selectedLanguage}
            isSearchable={false}
            onChange={this.handleChangeSelect}
            autoFocus={true}
            // menuIsOpen={true}
          />
        </div>

        <div className="text-section">
          <div className="image">
            {isLoading ? (
              <div className="loading">
                <span>Now Converting...</span>
                <ReactLoading type="bars" color="#fd8d8e" />
              </div>
            ) : (
              ""
            )}
            {image ? <img src={image} crossOrigin="anonymous" alt={image} /> : ""}
          </div>
          <div className="text">
            <textarea
              value={text}
              ref={this.textArea}
              onChange={this.handleInputText}
              placeholder="Converted text..."
            ></textarea>
          </div>
        </div>

        <div className="btns">
          <button type="button" ref={this.textCopyBtn} className="ko">
            복사하기
          </button>
          <button type="button" onClick={this.handleReadAgain} className="ko">
            재인식
          </button>
          <button type="button" onClick={this.handleReset}>
            Clear
          </button>
        </div>
        <div className="use-way">
          <h2>Directions for use</h2>
          <span className="ko">
            ( 권장되는 방법 )<br /> <b>앨범 속 보정된 사진을 사용하는 것</b>이 사진을 바로 찍어서 사용하는 것보다 글자
            인식률이 높습니다.
          </span>
          <span className="en">
            ( Recommended )<br /> <b>Using calibrated pictures in an album</b> is more recognizable than taking and
            using them.
          </span>
        </div>
        <p className="copyright">made by pumpkinzomb.</p>
      </div>
    );
  }
}
