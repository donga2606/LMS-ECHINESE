import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useWrap } from "~/context/wrap";
import { Form, Input, Checkbox } from "antd";
import Editor from "~/components/Elements/Editor";
import { exerciseApi } from "~/apiBase/";
import { dataQuestion } from "~/lib/question-bank/dataBoxType";

// let returnSchema = {};
// let schema = null;

const ChoiceForm = (props) => {
  const { isSubmit, questionData, changeIsSubmit, visible, isGroup } = props;
  const { showNoti } = useWrap();
  const {
    formState: { isSubmitting, errors, isSubmitted },
  } = useForm();
  const [form] = Form.useForm();
  const [questionDataForm, setQuestionDataForm] = useState(null);
  const [isResetEditor, setIsResetEditor] = useState(false);

  // console.log("Question in form: ", questionDataForm);

  // GET VALUE IN EDITOR
  const getDataEditor = (dataEditor) => {
    questionDataForm.Content = dataEditor;
    setQuestionDataForm({ ...questionDataForm });
  };

  // Reset value in form
  const resetForm = () => {
    questionDataForm.Content = "";
    questionDataForm.ExerciseAnswer.forEach((item) => {
      item.AnswerContent = "";
      item.isTrue = false;
    });
    setQuestionDataForm({ ...questionDataForm });
  };

  // ON CHANGE IS CORRECT
  const onChange_isCorrect = (e, AnswerID) => {
    let checked = e.target.checked;

    // Xóa các isTrue còn lại (vì là câu hỏi chọn 1 đáp án)
    questionData.ExerciseAnswer.forEach((item) => {
      item.isTrue = false;
    });

    // Tìm vị trí sau đó gán correct vào
    let AnswerIndex = questionDataForm.ExerciseAnswer.findIndex(
      (item) => item.ID == AnswerID
    );
    questionDataForm.ExerciseAnswer[AnswerIndex].isTrue = checked;
    setQuestionDataForm({ ...questionDataForm });
  };

  // ON CHANGE TEXT
  const onChange_text = (e, AnswerID) => {
    let text = e.target.value;
    let AnswerIndex = questionDataForm.ExerciseAnswer.findIndex(
      (item) => item.ID == AnswerID
    );
    questionDataForm.ExerciseAnswer[AnswerIndex].AnswerContent = text;
    setQuestionDataForm({ ...questionDataForm });
  };

  // SUBMIT FORM
  const handleSubmitQuestion = async () => {
    console.log("Question SUBMIT in form: ", questionDataForm);

    let res = null;
    try {
      if (questionDataForm.ID) {
        res = await exerciseApi.update(questionDataForm);
      } else {
        res = await exerciseApi.add(questionDataForm);
      }
      if (res.status == 200) {
        changeIsSubmit(questionDataForm.ID ? questionDataForm : res.data.data);
        showNoti(
          "success",
          `${questionDataForm.ID ? "Cập nhật" : "Thêm"} Thành công`
        );
        if (!questionDataForm.ID) {
          resetForm();
        }
        setIsResetEditor(true);

        setTimeout(() => {
          setIsResetEditor(false);
        }, 500);
      }
    } catch (error) {}
  };

  useEffect(() => {
    isSubmit && handleSubmitQuestion();
  }, [isSubmit]);

  useEffect(() => {
    visible ? setQuestionDataForm(questionData) : setQuestionDataForm(null);
  }, [visible]);

  // useEffect(() => {
  //   questionDataForm.ExerciseAnswer = [
  //     {
  //       ID: 1,
  //       AnswerContent: "",
  //       isTrue: false,
  //     },
  //     {
  //       ID: 2,
  //       AnswerContent: "",
  //       isTrue: false,
  //     },
  //     {
  //       ID: 3,
  //       AnswerContent: "",
  //       isTrue: false,
  //     },
  //     {
  //       ID: 4,
  //       AnswerContent: "",
  //       isTrue: false,
  //     },
  //   ];
  //   setQuestionDataForm([...questionDataForm]);
  // }, [isGroup]);

  // console.log

  return (
    <div className="form-create-question">
      {visible && questionDataForm && (
        <Form form={form} layout="vertical">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <Form.Item name="Question" label="Câu hỏi">
                  <Editor
                    visible={visible}
                    handleChange={(value) => getDataEditor(value)}
                    isReset={isResetEditor}
                    questionContent={questionData?.Content}
                    questionData={questionData}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <p className="style-label">Đáp án</p>
              </div>
              {questionDataForm?.ExerciseAnswer.map((item, index) => (
                <div className="col-md-6 col-12" key={index}>
                  <div className="row-ans">
                    <Checkbox
                      checked={item.isTrue}
                      onChange={(e) => onChange_isCorrect(e, item.ID)}
                    ></Checkbox>
                    <Form.Item>
                      <Input
                        value={item.AnswerContent}
                        className="style-input"
                        onChange={(e) => onChange_text(e, item.ID)}
                      ></Input>
                    </Form.Item>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ChoiceForm;