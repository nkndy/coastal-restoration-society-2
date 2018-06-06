// Create a Stripe client.
var stripe = Stripe('pk_test_sVOSwu1mjrLOs2C6m9Gjia8t');

// Create an instance of Elements.
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    // color: '#32325d',
    // lineHeight: '18px',
    // fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    // fontSmoothing: 'antialiased',
    // fontSize: '16px',
    // '::placeholder': {
    //   color: '#aab7c4'
    // }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission.
function submitForm(token) {
  console.log($('#FormControlInputName').val());
  console.log($('#FormControlInputCompany').val());
  console.log($('#FormControlInputPhone').val());
    $.ajax({
        url: 'https://wt-b9fa931cbbfbac80477a7365ca8d3306-0.sandbox.auth0-extend.com/coastal-restoration-stripe',
        type: 'POST',
        data: {
          stripeToken: token,
          email: $('#FormControlInputEmail').val(),
          metadata: {
            "name": $('#FormControlInputName').val(),
            "company_name": $('#FormControlInputCompany').val(),
            "phone": $('#FormControlInputPhone').val()
          }
        }
    }).then(function(stripeCustomer) {
      $('#payment-submit').text("success");
      console.log(stripeCustomer);
    }).fail(function(e) {
      $('#payment-submit').text(e.responseJSON.message);
    });
  }

//create a token
var form = document.getElementById('payment-form');
var button = document.getElementById('payment-submit')
button.addEventListener('click', function(event) {
  event.preventDefault();
  console.log('pressed')
  $('#payment-submit').text("spinner");
  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error.
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server.
      submitForm(result.token);
    }
  });
});
