import "./App.css";
import axios from "axios";
import React, { useEffect } from "react";
import logo from "./logo.jpeg";

function App() {
  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState] = React.useState([]);

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

  const createRazorpayOrder = (amount) => {
    let data = JSON.stringify({
      amount: amount * 100,
      currency: "INR",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:5000/orders",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        handleRazorpayScreen(response.data.amount);
      })
      .catch((error) => {
        console.log("error at", error);
      });
  };

  const handleRazorpayScreen = async () => {
    const res = await loadScript("https:/checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Some error at razorpay screen loading");
      return;
    }

    const options = {
      key: "rzp_live_mrweB6v6mx5SSc",
      amount: 100,
      currency: "INR",
      name: "Institute",
      description: "payment to Institute",
      image: logo,
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
      },
      prefill: {
        name: "IjajAhmed Akram Jaman",
        email: "ijaj.jaman08@gmail.com",
      },
      theme: {
        color: "#F4C430",
      },
    };

    if (typeof window.Razorpay !== "undefined") {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } else {
      console.error("Razorpay script not loaded yet!");
    }
  };

  const paymentFetch = (e) => {
    e.preventDefault();

    const paymentId = e.target.paymentId.value;

    axios
      .get(`http://localhost:5000/payment/${paymentId}`)
      .then((response) => {
        console.log(response.data);
        setResponseState(response.data);
      })
      .catch((error) => {
        console.log("error occures", error);
      });
  };

  // useEffect(() => {
  //   let data = JSON.stringify({
  //     amount: amount * 100,
  //   })

  //   let config = {
  //     method: "post",
  //     maxBodyLength: Infinity,
  //     url: `http://localhost:5000/capture/${responseId}`,
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: data
  //   }

  //   axios.request(config)
  //   .then((response) => {
  //     console.log(JSON.stringify(response.data))
  //   })
  //   .catch((error) => {
  //     console.log("error at", error)
  //   })
  // }, [responseId])

  return (
    <div className="App container">
      <header>
        <img src={logo} alt="AIYSRA Logo" />
        <h1>ऑल इंडिया यंग सायंटिस्ट रिसर्च असोसिएशन</h1>
        <h1></h1>
      </header>

      <div class="content">
        <div class="card">
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
          <a class="button" onClick={() => handleRazorpayScreen()}>
            आजच नाव बुक करा
          </a>
        </div>
      </div>
      {/* <button onClick={() => handleRazorpayScreen()}>Payment of 100Rs.</button> */}
      {/* {responseId && <p>{responseId}</p>}
      <h1>This is payment verification form</h1>
      <form onSubmit={paymentFetch}>
        <input type="text" name="paymentId" />
        <button type="submit">Fetch Payment</button>
        {responseState.length !== 0 && (
          <ul>
            <li>Amount: {responseState.amount / 100} Rs.</li>
            <li>Currency: {responseState.currency}</li>
            <li>Status: {responseState.status}</li>
            <li>Method: {responseState.method}</li>
          </ul>
        )}
      </form> */}
    </div>
  );
}

export default App;

// *दहावी झाली? करिअर निवडताना संभ्रमात आहात का? 🤔*
// तुमचे स्वप्न डॉक्टर, इंजिनियर बनण्याचे असो किंवा JEE, NEET, पोलीस भरती, प्रशासकीय अधिकारी, आर्मी, नेव्ही, *एअरफोर्स*मध्ये करिअर करण्याचे,
// AIYSRA तुमच्यासाठी घेऊन येत आहे एक महिन्याचा मोफत करिअर मार्गदर्शन कोर्स 🚀

// *या कोर्समध्ये तुम्हाला मिळेल:*
// ✅ विविध क्षेत्रातील तज्ज्ञ व अनुभवी शिक्षकांचे मार्गदर्शन
// ✅ दहावीनंतर योग्य विषय निवडण्यासाठी सखोल माहिती
// ✅ तुमच्या स्वप्नातील करिअर साध्य करण्याचा रोडमॅप
// ✅ प्रवेशासाठी लागणारी कागदपत्रे व प्रवेश प्रक्रियेची माहिती
// ✅ प्रवेश आरक्षणाचे नियम व शासकीय महाविद्यालयांची माहिती
// ✅ शैक्षणिक खर्च व शिष्यवृत्ती (स्कॉलरशिप)
// ✅ NDA (आर्मी, नेव्ही, एअरफोर्स), CET, JEE, NEET संदर्भातील मार्गदर्शन
// ✅ पोलीस भरतीसाठी पूर्वतयारी व प्रशिक्षण

// *फक्त ५० विद्यार्थ्यांसाठी मर्यादित प्रवेश!*
// ही सुवर्णसंधी तुम्हाला अगदी मोफत उपलब्ध आहे!

// तुमच्या यशस्वी भविष्यासाठी पहिलं पाऊल उचलण्यासाठी आम्ही मदत करू. 💡

// 📞 *7385429508*
// 👉 *खालील लिंकवर क्लिक करून आजच नाव नोंदणी करा!*

// ऑल इंडिया यंग सायंटिस्ट रिसर्च असोसिएशन (AIYSRA)
