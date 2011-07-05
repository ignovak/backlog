$.fn.initItem = function () {
  var $this = $(this);
  $this.find('.name').text($this.find('.name').find('a').text());
  $this.find('.edit').removeClass('edit').addClass('update');

  $this.find('.cancel').find('a').click(function() {
    cancelChanges($this);
  });

  $this.find('.update').find('a').text('Update').click(function() {
    updateItem(this.href, $this, function() {
      $this.find('.cancel').find('a').click();
    });
    return false
  });

  $this.find('.close').find('a').click(function() {
    if ( confirm('Are your sure?') ) { 
      $.get(this.href, function() {
        $this.hide();
      });
    };
    return false
  });

  $this.dblclick(function() {
    if ( $this.is('.active') ) { 
      return false;
    };
    $this.addClass('active');
    $this.find('.name').html($('<input>').val($this.find('.name').text())).find('input').focus();
    $this.find('.desc').html($('<textarea>').val($this.find('.desc').text()));
    $this.find('.priority').html($('<input>').val($this.find('.priority').text()));
    $this.find('input').keypress(function (e) {
      if ( e.keyCode == 13 ) {
        $this.find('.update').find('a').click();
      } else if ( e.keyCode == 27 ) {
        $this.find('.cancel').find('a').click();
      };
    });
  });

  return this
};

$('.bl-item').each(function() {
  $(this).initItem();
});

$('.bl-new').click(function() {
  var html = " \
    <li class='bl-item'> \
    <div class='bl-item-field name'><a href='#'></a></div> \
    <div class='bl-item-field desc'></div> \
    <div class='bl-item-field priority'>50</div> \
    <div class='bl-item-field cancel'><a href='#'>Cancel</a></div> \
    <div class='bl-item-field update'><a href='/'>Edit</a></div> \
    <div class='bl-item-field close'><a href=''>Close</a></div> \
    <div class='clear'></div> \
    </li> \
    ";
  var item = $(html).initItem().insertBefore($(this)).dblclick();
  item.find('.name').find('input').focus();
  item.find('.close').hide();
  item.find('.update').find('a').text('Create').click(function() {
    updateItem(this.href, item, function() {
      cancelChanges(item);
    });
    return false
  });
  item.find('.cancel').find('a').click(function() {
    item.remove();
  })
  return false
})

function updateItem(url, item, callback) {
  var params = {
    type: item.parents('section').find('h2').text(),
    name: item.find('.name').find('input').val(),
    desc: item.find('.desc').find('textarea').val(),
    priority: item.find('.priority').find('input').val()
  };
  $.post(url, params, callback);
};

function cancelChanges(item) {
  item.removeClass('active');
  item.find('.name').text(item.find('.name').find('input').val());
  item.find('.desc').text(item.find('.desc').find('textarea').val());
  item.find('.priority').text(item.find('.priority').find('input').val());
};
