
    var handler = StripeCheckout.configure({
      key: 'pk_test_sVOSwu1mjrLOs2C6m9Gjia8t',
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      token: function(token) {
        $('.pay').prop("disabled", true);
        $('.pay').text('Paying...')
        $.ajax({
            url: 'https://wt-b9fa931cbbfbac80477a7365ca8d3306-0.sandbox.auth0-extend.com/coastal-restoration-stripe',
            type: 'POST',
            data: {
              stripeToken: token.id
            }
        }).then(function(stripeCustomer) {
          console.log('success');
        }).fail(function(e) {
          $('.pay').text('Buy');
          alert('There was an error processing the payment. Please try again.')
        });
      }
    });

    $(function() {
      $('.pay').on('click', function(e) {
        e.preventDefault();
        console.log("hello");
        handler.open({
          name: 'Title',
          description: 'My Subscription',
          panelLabel: "Subscribe",
          amount: 900, // 9 usd
          email: 'nicholas.stuart.kennedy@gmail.com',
          allowRememberMe: false
        });
      });
    });


    // close Checkout on page navigation
    $(window).on('popstate', function() {
      handler.close();
    });
