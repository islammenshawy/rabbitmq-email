    $(function () {

    // init the validator
    // validator files are included in the download package
    // otherwise download from http://1000hz.github.io/bootstrap-validator

    $('#contact-form').validator();

    function getSelectedQueue(){
        return $('input[name="gridRadios"]:checked').val();
    };

    function alertSucessMessage(message){
        $('#alert-danger').hide();
        $('#sucess_message').text(message);
        $('#alert_sucess').show();
    }

    function alertFailure(){
        $('#alert_sucess').hide();
        $('#alert-danger').show();
    }

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    
    $('#start_listener').on('click', function (e) {
            var url = "startlistener";
            var selectedQueue = getSelectedQueue();
            $.ajax({
                type: "GET",
                url: url,
                data: {
                  queue: selectedQueue
                },
                success: function (data)
                {
                    var messageAlert = 'Listner Started successfully';
                    alertSucessMessage(messageAlert)
                },
                error: function(data){
                    alertFailure();
                }
            });
    });

     $('#clear_queue').on('click', function (e) {
            var url = "clearqueue";
            var selectedQueue = getSelectedQueue();
            $.ajax({
                type: "GET",
                url: url,
                data: {
                  queue: selectedQueue
                },
                success: function (data)
                {
                    var messageAlert = 'Queue cleared successfully';
                    alertSucessMessage(messageAlert)
                },
                error: function(data){
                    alertFailure();
                }
            });
    }); 

    // when the form is submitted
    $('#contact-form').on('submit', function (e) {

        // if the validator does not prevent form submit
        if (!e.isDefaultPrevented()) {
            var url = "sendemail";

            // POST values in the background the the script URL
            $.ajax({
                type: "POST",
                url: url,
                data: $(this).serialize(),
                success: function (data)
                {
                    var messageAlert = 'Message sent to queue successfully';
                    alertSucessMessage(messageAlert)
                },
                error: function(data){
                    alertFailure();
                }
            });
            return false;
        }
    })
});