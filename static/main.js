var backlog;

$.fn.initItem = function () {
  var $this = $(this);
  $this.find('.cancel').find('a').click(function() {
    cancelChanges($this);
  });

  $this.find('.update').find('a').click(function() {
    updateItem('/' + $this.data('id') + '/edit', $this, function() {
      $this.find('.cancel').find('a').click();
    });
    return false
  });

  $this.find('.close').find('a').click(function() {
    if ( confirm('Are your sure?') ) { 
      $.get('/' + $this.data('id') + '/close', function() {
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

$('a', '.bl-new').click(function() {
  var html = $('#template').clone().fillTemplate({
      type: '',
      name: '',
      priority: 50
    })[0].innerHTML;
  var htmlo = " \
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
  item.find('.update').find('a').text('Create').unbind('click').click(function() {
    updateItem('/', item, function() {
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

$('a', '.remove').click(function() {
  var $this = $(this);
  $.get(this.href, function() {
    $this.parents('.bl-item').hide();
  });
  return false
});

$.get('/', function(data) {
  backlog = data.data;
  $('section').each(function() {
    var $this = $(this);
    var html = $('#template').clone().fillTemplate(data.data.filter(function (i) {
      return i.type == $this.find('h2').text();
    }).sort(function (a, b) {
      return b.priority - a.priority;
    }))[0].innerHTML;
    $(html).insertAfter($this.find('.bl-header'));
  });
  $('.bl-item').each(function() {
    $(this).initItem();
  });
}, 'json');

function getItemById(id) {
  for (var i = 0, l = backlog.length; i < l; i++) {
    if ( backlog[i].id == id ) { 
      return backlog[i]
    };
  };
  console.error('item not found');
};
