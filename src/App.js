import "./App.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import logo from "./logo.jpeg";
import Swal from "sweetalert2";
import flasher from "@flasher/flasher";

function App() {
  const [responseId, setResponseId] = React.useState("");
  console.log("responseId :", responseId);
  const [responseState, setResponseState] = React.useState([]);
  const [registered, setRegistered] = useState("Incomplete");
  console.log("registered :", registered);
  const [id, setId] = useState("");
  console.log("id :", id);
  const [errors, setError] = useState("");
  const [button, setButton] = useState(false);
  const [File, setFile] = useState("");

  const [formInfo, setFormInfo] = useState({
    studName: "",
    email: "",
    mobile: "",
    company: "",
    paystatus: "UnPaid",
  });

  const FRONTEND_URL = "https://career-marg.vercel.app/";
  const BACKEND_URL = "https://student-backend-c616.onrender.com/";

  const handleImg = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInput = (e) => {
    setFormInfo({
      ...formInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButton(true)
    const formData = new FormData();
    formData.append("studName", formInfo.studName);
    formData.append("email", formInfo.email);
    formData.append("mobile", formInfo.mobile);
    formData.append("company", formInfo.company);
    formData.append("paystatus", formInfo.paystatus);
    formData.append("file", File);
    try {
      const response = await axios.post(
        "https://student-backend-c616.onrender.com/api/student",
        formData
      );
      if (response.data.error) {
        console.log("response.data.error :", response.data.error);
        setButton(false)
        setError(response.data.error);
      } else {
        setRegistered("Complete");
        localStorage.setItem("registered", "Complete");
        setButton(false)
        setFile("");
        setFormInfo({
          studName: "",
          email: "",
          mobile: "",
          company: "",
        });
        console.log("response.data :", response.data.data._id);
        setId(response.data.data._id);
        localStorage.setItem("studid", response.data.data._id);
        Swal.fire({
          title: "Registered Successful",
          text: "Make the Payment to confirm seat!",
          icon: "success",
          // showCancelButton: true,
          confirmButtonColor: "green",
          cancelButtonColor: "#d33",
          confirmButtonText: "Payment",
        }).then(async (result) => {
          if (result.isConfirmed) {
            createRazorpayOrder();
          }
        });
      }
    } catch (error) {
      console.log(error);
      setButton(false)
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    // formData.append("studName", formInfo.studName);
    // formData.append("email", formInfo.email);
    // formData.append("mobile", formInfo.mobile);
    // formData.append("company", formInfo.company);
    formData.append("paystatus", "Paid");
    formData.append("responseId", responseId);
    // formData.append("file", File);
    try {
      const response = await axios.put(
        `https://student-backend-c616.onrender.com/api/student/${id}`,
        formData
      );

      if (response.data.status == "Updated Successfully") {
        // alert("Edited Successfully");
        localStorage.setItem("studid", "");
        setId("");
        setResponseId("");
        setRegistered("Incomplete");
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const paymentFetch = async () => {
    await axios
      .get(`https://student-backend-c616.onrender.com/payment/${responseId}`)
      .then((response) => {
        // setResponseState(response.data);
        if (response.data) {
          if (response.data.status == "authorized") {
            alert("Payment Successfully");
            handleUpdate();
            localStorage.setItem("registered", "Incomplete");
            setRegistered("Incomplete");
          } else {
            alert("Error Unauthorized User Payment");
            setError("Unauthorized User Payment");
          }
        }
      })
      .catch((error) => {
        console.log("error occures", error);
      });
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayScreen = async (amount) => {
    const res = await loadScript("https:/checkout.razorpay.com/v1/checkout.js");
    console.log("res :", res);
    if (!res) {
      alert("Some error at razorpay screen loading");
      return;
    }

    const options = {
      key: "rzp_live_ojIqx1hLEKLYmC",
      amount: amount,
      currency: "INR",
      name: "Institute",
      description: "payment to Institute",
      image: logo,
      handler: function (response) {
        //  if (response) {
        //   paymentFetch(response.razorpay_payment_id);
        // }
        setResponseId(response.razorpay_payment_id);
      },
      prefill: {
        name: "IjajAhmed Akram Jaman",
        email: "ijaj.jaman08@gmail.com",
      },
      theme: {
        color: "#61dafb",
      },
    };

    if (typeof window.Razorpay !== "undefined") {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } else {
      alert("Razorpay script not loaded yet!");
    }
  };

  const createRazorpayOrder = async () => {
    let data = JSON.stringify({
      amount: 1 * 100,
      currency: "INR",
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://student-backend-c616.onrender.com/orders",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    await axios
      .request(config)
      .then((response) => {
        handleRazorpayScreen(response.data.amount);
      })
      .catch((error) => {
        console.log("error at", error);
      });
  };

  useEffect(() => {
    if (id == "" || responseId == "") {
      let studid = localStorage.getItem("studid");
      if (studid != undefined && studid != null) {
        setId(studid);
      }
      setRegistered(localStorage.getItem("registered"));
    } else {
      paymentFetch();
    }
  }, [responseId, id]);

  return (
    <div className="App">
      <header>
        <img src={logo} alt="AIYSRA Logo" />
        <h1>ऑल इंडिया यंग सायंटिस्ट रिसर्च असोसिएशन</h1>
        <h1></h1>
      </header>

      <div className="content">
        <div className="card">
          <h2>दहावी झाली? करियर बाबत संभ्रमात आहात का? 🤔</h2>
          <p>
            तुमचे स्वप्न डॉक्टर, इंजिनियर JEE, NEET, पोलिस, प्रशासकीय अधिकारी,
            आर्मी, नेव्ही, एअरफोर्स याविषयीची माहिती AIYSRA मार्फत अगदी मोफत...
          </p>
          <p>
            आमच्या १ महिन्याच्या करिअर मार्गदर्शन कोर्समध्ये सहभागी व्हा 🚀 आणि
          </p>
          <ul
            style={{
              textAlign: "left",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            <li>✅ विविध क्षेत्रातील तज्ञ, अनुभवी शिक्षकांचे मार्गदर्शन.</li>
            <li>✅ दहावीनंतर योग्य विषय कसे निवडायचे याबाबत सखोल माहिती.</li>
            <li>✅ तुमचे स्वप्नातील करिअर साध्य करण्याचा रोडमॅप!</li>
            <li>
              ✅ प्रवेशा संबंधित कागदपत्रांची माहिती, प्रवेश आरक्षण माहिती.
            </li>
            <li>✅ शासकीय महाविद्यालयांची माहिती.</li>
            <li>✅ शैक्षणिक खर्च व स्कॉलरशिप.</li>
            <li>
              ✅ एनडीए (आर्मी, नेव्ही, एअरफोर्स) CET, JEE, NEET ची माहिती.
            </li>
            <li>✅ भरतीपूर्व प्रशिक्षण (पोलीस भरती).</li>
          </ul>
          <p>
            <strong>मर्यादित प्रवेश:</strong> फक्त ५० विद्यार्थ्यांसाठी!
          </p>
          <p>ही सुवर्णसंधी मोफत तुमच्यासाठी उपलब्ध आहे!</p>
          <p>तुमच्या यशस्वी भविष्यासाठी पहिलं पाऊल आम्ही घ्यायला मदत करू. 💡</p>

          {registered != "Complete" ? (
            <div className="row justify-content-center">
              <h4 className="text-center mt-2">Registration Form</h4>
              <div className="shadow p-4 border mt-4">
                <form onSubmit={(e) => handleSubmit(e)}>
                  <div className="row">
                    <div className="mb-3 col-sm-6">
                      <label htmlFor="studName" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formInfo.studName}
                        onChange={(e) => handleInput(e)}
                        id="studName"
                        required
                        name="studName"
                        placeholder="Enter Name"
                      />
                    </div>
                    <div className="mb-3 col-sm-6">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        onChange={(e) => handleInput(e)}
                        value={formInfo.email}
                        id="email"
                        required
                        name="email"
                        placeholder="Enter Email"
                      />
                    </div>
                    <div className="mb-3 col-sm-6">
                      <label htmlFor="mobile" className="form-label">
                        Mobile Number
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="mobile"
                        onChange={(e) => handleInput(e)}
                        required
                        name="mobile"
                        value={formInfo.mobile}
                        placeholder="Enter Mobile No."
                      />
                    </div>
                    <div className="mb-3 col-sm-6">
                      <label htmlFor="company" className="form-label">
                        College
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="company"
                        onChange={(e) => handleInput(e)}
                        required
                        value={formInfo.company}
                        name="company"
                        placeholder="Enter Company Name"
                      />
                    </div>
                    <div className="mb-3 col-sm-6">
                      <img
                        src={
                          File
                            ? File.name
                              ? URL.createObjectURL(File)
                              : BACKEND_URL + File
                            : FRONTEND_URL + "/assets/noimage.png"
                        }
                        alt="profile"
                        width="150px"
                        height="150px"
                        className="mb-2"
                      />
                      <input
                        type="file"
                        className="form-control"
                        id="file"
                        onChange={(e) => handleImg(e)}
                        name="file"
                      />
                    </div>
                    <div className="mb-3 col-sm-6"></div>
                    <div className="mb-3 col-sm-3"></div>

                    <button className="btn btn-success col-sm-6" disabled={button} type="submit">
                      आजच नाव बुक करा
                    </button>
                    <div className="mb-3 col-sm-3"></div>
                  </div>
                  <p className="text-danger">
                    {typeof button == "string" && errors}
                  </p>
                </form>
              </div>
            </div>
          ) : (
            <button
              onClick={() => createRazorpayOrder()}
              className="btn btn-success col-sm-6 m-auto"
              type="button"
            >
              Pay to Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// 1. pay_PZOYMvOb0MMBiQ
