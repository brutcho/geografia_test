(function() {


    var Calendar = (function(timestamp) {
    
    var rowTotal   = 5;
    var Events = JSON.parse(localStorage.getItem('Events')) || [];
    //  [
    //     {
    //         uid: 1488913200000,
    //         event: "8 марта",
    //         date: "14:00",
    //         names: "Петя, Паша",
    //         description: "Международный женский день" 
    //     },
    //     {
    //         uid: 1489086000000,
    //         event: "Встреча",
    //         date: "19:00",
    //         names: "Маша",
    //         description: "Ужин в ресторане"            
    //     }
    // ];
    var currentDate = {
        month: (new Date()).getMonth(),
        year: (new Date()).getFullYear()
    };
    var _currentDay;
    var local = {
            week: [
                'Понедельник',
                'Вторник',
                'Среда',
                'Четверг',
                'Пятница',
                'Суббота',
                'Воскресенье'],
            day: "день",
            month: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',
                'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            year: "год"
        };
    var params = {
            uid: null,
            timestamp: timestamp ? timestamp : (new Date().getTime()),
            // age: age ? age : 0,
            // day: day ? day : 1,
            lang: "ru"
        };

    /**
     * ПОЛУЧИТЬ ТЕКУЩИЙ ДЕНЬ В МИЛЛИСЕКУНДАХ С УСТАНОВЛЕННЫМ ВРЕМЕНЕМ 00:00:00
     * 
     */
    function _getCurrentDayTime() {
        var time = new Date();

        time.setHours(0);
        time.setMinutes(0);
        time.setMilliseconds(0);
        time.setSeconds(0);

        return time.getTime();       
    }
    /**
     * @params month, year
     * return [String] week 
     */
    function _getFirstDayMonth(year, month) {
        var firstDay = new Date(year, month, 1,0,0,0,0);

        return firstDay.getDay();
    }

    function _hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function _renderTable() {
        var container, div, title, table, tbody, tr, th, style;
        // создаем таблицу
        container = document.getElementById("calendar-table");
        container.innerHTML = '';
        div = document.createElement('div');
        div.className = "td";
        container.appendChild(div);
        //div.innerHTML = "";
        
        table = document.createElement('table');
        div.appendChild(table);
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
 
        // отрисовка таблицы



        var dayNum = 1;
        var months = [];
        var aDay;
        var DAY = 86400000; // сутки в милисекундах
        // отсчет начинаем с первого календарного дня месяца

        var fDay = _getFirstDayMonth(currentDate.year, currentDate.month);
        var fDayTS = new Date(currentDate.year, currentDate.month,1,0,0,0,0).getTime();

        // вычисляем timestamp выпадающий на понедельник
        

        aDay = fDayTS - (DAY*(fDay-1));


        for (var row = 0; row < rowTotal; row++) {
            tr = document.createElement('tr');
            tbody.appendChild(tr)
            for (var col = 0; col < 7; col++) {
                if (row == 0) {

                    //заполняем шапку календаря днями недели
                    var td = document.createElement('td');

                    td.innerHTML = local.week[col] + ", " + (new Date(aDay)).getDate();

                } else {
                    // заполняем тело календаря
                    if (row == 1 && col == 0) {
                        months[0] = (new Date(aDay)).getMonth()+1; 
                    } else if (row == rowTotal-1 && col == 6) {
                        months[1] = (new Date(aDay)).getMonth()+1;
                        if (months[0] == months[1]) {
                            months.pop();
                        // //console.log('last day', months);
                        }
                    }
                    td = document.createElement('td');
                    td.innerHTML = (new Date(aDay)).getDate();
                }
                //td.className = (col == 5 || col == 6) ? 'weekend' : '';

                Events.forEach(function(event) {
                    if (!!event && parseInt(event.uid) == aDay) {
                        td.className = "active";
                        td.innerHTML += "<br/><b>" + event.event +
                            "</b><br/>" + event.date +
                            "<br/>" + event.names +
                            "<br/>" + event.description;
                    }
                });


                td.setAttribute('data-day', aDay);
                td.addEventListener("click", function(e){
                    // console.log(event.target.getAttribute('data-day'));
                    var el = e.target;
                    if (_hasClass(el,'active')){
                        
                        var uid = parseInt(el.getAttribute('data-day'));
                        var data;
                        Events.forEach(function(event) {
                            data = event;
                        });
                        var wrap = document.createElement('div');
                        wrap.className = 'add-form-edit';
                        e.target.appendChild(wrap);
                        var close = document.createElement('span');
                        close.className = "btnClose";
                        close.innerHTML = "x";
                        close.addEventListener('click', function(event){
                            wrap.parentNode.removeChild(wrap);
                        }, false);


                        var btnClean = document.createElement('button');
                        btnClean.innerHTML = "очистить";
                        btnClean.className = "btn-clean";
                        btnClean.addEventListener('click', function(event) {
                            wrap.parentNode.removeChild(wrap);
                            console.log('className удаляем, клетку очищаем и данные тоже сносим');
                            el.innerHTML = (new Date(data.uid)).getDate();
                            el.removeAttribute('class');
                            
                            Events.forEach(function(event,i) {
                                if (!!event && data.uid == event.uid) {
                                    delete Events[i];
                                }
                            });
                            localStorage.setItem('Events', JSON.stringify(Events));
                            
                        }, false);


                        var fieldEvent = document.createElement('h3');
                        fieldEvent.innerHTML = data.event;
     
                        var fieldDate = document.createElement('p');
                        fieldDate.innerHTML = data.date;

                        var fieldName = document.createElement('p');
                        fieldName.innerHTML = data.names;


                        var fieldDescription = document.createElement('textarea');
                        fieldDescription.className = "field-description";
                        fieldDescription.value = data.description;
                        
                        var btn = document.createElement('button');
                        btn.innerHTML = "Готово";
                        btn.className = "btn-add";
                        btn.addEventListener('click', function(e) {
                            data.description = fieldDescription.value;
                            el.innerHTML = (new Date(uid)).getDate() + "<br/><b>" +
                                data.event +
                                "</b><br/>" + data.date +
                                "<br/>" + data.names +
                                "<br/>" + data.description;

                            wrap.parentNode.removeChild(wrap);
                        }, false);


                        wrap.appendChild(close);
                        wrap.appendChild(fieldEvent);
                        wrap.appendChild(fieldDate);
                        wrap.appendChild(fieldName);
                        wrap.appendChild(fieldDescription);
                        wrap.appendChild(btn);
                        wrap.appendChild(btnClean);

                    } else {
                        var wrap = document.createElement('div');
                        wrap.className = 'add-form-advanced';
                        event.target.appendChild(wrap);
                        var close = document.createElement('span');
                        close.className = "btnClose";
                        close.innerHTML = "x";
                        close.addEventListener('click', function(e){
                            wrap.parentNode.removeChild(wrap);
                        }, false);

                        var btn = document.createElement('button');
                        btn.innerHTML = "Готово";
                        btn.className = "btn-add";

                        var btnClean = document.createElement('button');
                        btnClean.innerHTML = "очистить";
                        btnClean.className = "btn-clean";

                        var fieldUID = document.createElement('input');
                        fieldUID.setAttribute('type', 'hidden');
                        fieldUID.value = el.getAttribute('data-day');

                        var fieldEvent = document.createElement('input');
                        fieldEvent.className = "field-add";
                        fieldEvent.setAttribute('placeholder','Событие');
     
                        var fieldDate = document.createElement('input');
                        fieldDate.className = "field-date";
                        fieldDate.setAttribute('placeholder', 'Время события');

                        var fieldName = document.createElement('input');
                        fieldName.className = "field-name";
                        fieldName.setAttribute('placeholder', 'Имена участников');

                        var fieldDescription = document.createElement('textarea');
                        fieldDescription.className = "field-description";
                        fieldDescription.setAttribute('placeholder', 'Описание');

                        btn.addEventListener('click', function(e){
                            console.log(e.target);
                            var data = {
                                uid: parseInt(fieldUID.value),
                                event: fieldEvent.value,
                                date: fieldDate.value,
                                names: fieldName.value,
                                description: fieldDescription.value
                            };
                            Events.push(data);
                            localStorage.setItem('Events', JSON.stringify(Events));
                            wrap.parentNode.removeChild(wrap);
                            _renderTable(); 

                        }, false);

                        wrap.appendChild(close);
                        wrap.appendChild(fieldEvent);
                        wrap.appendChild(fieldDate);
                        wrap.appendChild(fieldName);
                        wrap.appendChild(fieldDescription);
                        wrap.appendChild(btn);
                        wrap.appendChild(btnClean);
                    }


                }, false);
                tr.appendChild(td);
                aDay += DAY;
            }
        }

    }

    function _init() {

        var btnAdd = document.getElementById('add');

        btnAdd.addEventListener('click', function(event){
            var wrap = document.createElement('div');
            wrap.className = 'add-form';
            document.getElementById('sidebar').appendChild(wrap);
            var close = document.createElement('span');
            close.className = "btnClose";
            close.innerHTML = "x";
            close.addEventListener('click', function(event){
                wrap.parentNode.removeChild(wrap);
            }, false);

            



            var inputAdd = document.createElement('input');
            inputAdd.className = "field-add";
            inputAdd.setAttribute('placeholder', '8 марта, 14:00, праздник');
            inputAdd.addEventListener('keyup', function(e) {

            }, false);

            var btn = document.createElement('button');
            btn.innerHTML = "Создать";
            btn.className = "btn-add";
            btn.addEventListener('click', function(event) {
                var monthList = [
                    'января',
                    'февраля',
                    'марта',
                    'апреля',
                    'мая',
                    'июня',
                    'июля',
                    'августа',
                    'сентября',
                    'октября',
                    'ноября',
                    'декабря'
                ];
                var data = inputAdd.value.split(',');
                var newDay = parseInt(data[0].split(' ')[0].trim());
                var newMonth = monthList.indexOf(data[0].split(' ')[1].trim());
                var uid = (new Date(currentDate.year, newMonth, newDay, 0,0,0,0)).getTime();
                var newEvent = {
                    uid: uid,
                    event: data[0].trim(),
                    date: data[1].trim(),
                    names: '',
                    description: data[2].trim()
                };
                wrap.parentNode.removeChild(wrap);
                Events.push(newEvent);
                localStorage.setItem('Events', JSON.stringify(Events));
                displayCurrent.innerHTML = local.month[currentDate.month] + ' ' + currentDate.year;
                _renderTable(); 

            }, false);

            wrap.appendChild(close);
            wrap.appendChild(inputAdd);
            wrap.appendChild(btn);

        }, false);

        var btnUpdate = document.getElementById('update');
        btnUpdate.addEventListener('click', function(event){
            location.href = location.href;
        }, false);

        var displayCurrent  = document.getElementById('current');
        displayCurrent.innerHTML = local.month[currentDate.month] + ' ' + currentDate.year;

        var btnNext = document.getElementById('next');


        var btnPrev = document.getElementById('prev');
        btnPrev.addEventListener('click', function(event){
            currentDate.month = (!currentDate.month) ? 11 : currentDate.month-1;
            if (currentDate.month == 11) {
                currentDate.year = currentDate.year-1;
            }
            displayCurrent.innerHTML = local.month[currentDate.month] + ' ' + currentDate.year;
            _renderTable();
        }, false);

        var searchResults = document.getElementById('results');

        var btnToday = document.getElementById('today');
        btnToday.addEventListener('click', function(event){
            currentDate = {
                month: (new Date()).getMonth(),
                year: (new Date()).getFullYear()
            };
            displayCurrent.innerHTML = local.month[currentDate.month] + ' ' + currentDate.year;
            _renderTable();
        }, false);

        btnNext.addEventListener('click', function(event){
            currentDate.month = (currentDate.month > 10) ? 0 : currentDate.month+1;
            if (!currentDate.month) {
                currentDate.year = currentDate.year+1;
            }
            displayCurrent.innerHTML = local.month[currentDate.month] + ' ' + currentDate.year;
            _renderTable();
             // перерисовываем календарь
        }, false);

        var inputSearch = document.getElementById('search');
        inputSearch.addEventListener('keyup', function(e) {

        var query = this.value.toLowerCase();
        var Ev = Events.map(function(event){
            return event.event + " " + event.date + " " + event.names + " " + event.description;
        });

        var filterEvents = Ev.filter(function(event) {
          return event.toLowerCase().indexOf(query) > -1;
        });
        
        
        if (query == "") {
            searchResults.style.display = 'none';
            searchResults.innerHTML = "";
        }else if (filterEvents.length>0) {
            searchResults.style.display = 'block';
            searchResults.innerHTML = filterEvents.join('<br/>');
        } else {
            searchResults.style.display = 'none';
            searchResults.innerHTML = "";
        }

        }, false);

        _renderTable();


    }


    return {
        get: function() {
            _init();
        }
        // firstDay: function(y,m) {
        //     return _getFirstDayMonth(y,m);
        // }
    }
})();

Calendar.get();
})();
// реализовать запись в localStorage

// реализовать фильтрацию данных календаря








  