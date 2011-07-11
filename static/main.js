// var backlog;
var orderList;

$.fn.initItem = function () {
  var $this = $(this);

  $this.find('.cancel').find('a').click(function() {
    cancelChanges($this);
    return false
  });

  $this.find('.update').find('a').click(function() {
    updateItem('/' + $this.attr('id') + '/edit', $this, function() {
      $this.find('.cancel').find('a').click();
    });
    return false
  });

  $this.find('select').val($this.data('status'));
  $this.find('select').change(function() {
    var val = $(this).val();
    $this.removeClass('assigned processed completed closed').addClass(val);
    $.post('/' + $this.attr('id') + '/update_status', { status: val });
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
  var item = $('#template').clone().fillTemplate({
      type: '',
      desc: '',
      name: '',
      priority: 50
    }).find('.bl-item').initItem().insertBefore($(this).parent()).dblclick();
  item.find('.name').find('input').focus();
  item.find('.update').find('a').text('Create').unbind('click').click(function() {
    updateItem('/', item, function() {
      cancelChanges(item);
      item.addClass('new');
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
    priority: item.find('.priority').find('input').val(),
    status: item.find('select').val()
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
  // backlog = data.data;
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
  $('.bl-items-list').sortable({
      opacity: 0.7,
      cursor: 'move',
      items: '> .bl-item',
      // revert: true,
      update: function (e, ui) {
        var $item = $(ui.item);
        var id = $item.attr('id');
        var prevPr = parseInt($item.prev('.bl-item').find('.priority').text());
        var nextPr = parseInt($item.next('.bl-item').find('.priority').text());
        if ( isNaN(prevPr) ) prevPr = nextPr + 20;
        if ( isNaN(nextPr) ) nextPr = 0;
        var itemPr = Math.floor((prevPr + nextPr) / 2);
        $item.find('.priority').text(itemPr);
        for (var i = 0, l = orderList.length; i < l; i++) {
          if ( orderList[i].split('=')[0] == id ) { 
            orderList[i] = id + '=' + itemPr;
            break;
          };
        };
        $.post('/' + $item.attr('id') + '/update_priority', { priority: itemPr });
      }
    });
}, 'json');

$('h2').click(function() {
  $(this).parent().toggleClass('minimized');
});

(function getOrder() {
  $.get('/getOrder', function(data) {
    // console.log(data.data);
    // function arraysDiff(a, b) {
    var diff = data.data.filter(function(i) {
      return orderList && orderList.indexOf(i) == -1;
    });
    diff.forEach(function (v, k) {
      var el = v.split('=');
      var id = el[0];
      var prior = parseInt(el[1]);
      var item = $('#' + id);
      if ( parseInt(item.find('.priority').text()) < prior ) {
        var placeholder = item.prev();
        while ( parseInt(placeholder.find('.priority').text()) < prior ) { 
          placeholder = placeholder.prev();
        };
        item.insertAfter(placeholder);
      } else {
        var placeholder = item.next();
        while ( parseInt(placeholder.find('.priority').text()) > prior ) { 
          placeholder = placeholder.next();
        };
        item.insertBefore(placeholder);
      };
      
      item.find('.priority').text(prior);
    });
    // console.log(diff);

    orderList = data.data;
    // };
  }, 'json');

  setTimeout(getOrder, 10000);
})();
// function getItemById(id) {
//   for (var i = 0, l = backlog.length; i < l; i++) {
//     if ( backlog[i].id == id ) { 
//       return backlog[i]
//     };
//   };
//   console.error('item not found');
// };
