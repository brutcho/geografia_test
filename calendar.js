(function() {
    var Calendar = (function() {
    var prop = {
            DAY: 86400000,
            rowTotal: 5,
            local: {
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
                monthList: [
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
                ],
                year: "год"
            },
            currentDate: {
                month: (new Date()).getMonth(),
                year: (new Date()).getFullYear()
            },
            dialog: false
        };
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
    var _currentDay;

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

    function _isDialog() {
        if (prop.dialog) {
            return true;
        }
        prop.dialog = true;
        return false;
    }
    function _dialogOff() {
        prop.dialog = false;
        return;
    }

    function _createElement(name, text, cls) {
        var el = document.createElement(name);
        if (text) {
            el.innerHTML = text;
        }
        if (cls) {
            el.className = cls;
        }
        return el;
    }

    function _initSidebar() {
        var sidebar = document.getElementById('sidebar');
        var searchResults = document.getElementById('results');
        var displayCurrent  = document.getElementById('current');
        displayCurrent.innerHTML = prop.local.month[prop.currentDate.month] + ' ' + prop.currentDate.year;

        sidebar.addEventListener('mousedown', function(e) {
            if (e.target.id === 'add') {
                if (_isDialog()) {
                    return;
                }
                var wrap = _createElement('div', null, 'add-form');
                document.getElementById('sidebar').appendChild(wrap);
                var close = _createElement('span', 'x', 'btnClose');
                close.addEventListener('mousedown', function(event){
                    _dialogOff();
                    wrap.parentNode.removeChild(wrap);
                }, false);

                var inputAdd = _createElement('input', null, 'field-add');
                inputAdd.setAttribute('placeholder', '8 марта, 14:00, праздник');
                inputAdd.addEventListener('keyup', function(e) {

                }, false);

                var btnCreate = _createElement('button', 'Создать', 'btn-add');
                btnCreate.addEventListener('mousedown', function(event) {
                    if (!inputAdd.value) {
                        console.log('вы ничего не ввели');
                        return false;
                    }
                    var data = inputAdd.value.split(',');
                    var newDay = parseInt(data[0].split(' ')[0].trim());
                    var newMonth = prop.local.monthList.indexOf(data[0].split(' ')[1].trim());
                    var uid = (new Date(prop.currentDate.year, newMonth, newDay, 0,0,0,0)).getTime();
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
                    displayCurrent.innerHTML = prop.local.month[prop.currentDate.month] + ' ' + prop.currentDate.year;
                    _renderTable(); 
                    _dialogOff();

                }, false);

                wrap.appendChild(close);
                wrap.appendChild(inputAdd);
                wrap.appendChild(btnCreate);                
            } else if (e.target.id === 'update') {
                location.href = location.href;
            } else if (e.target.id === 'next') {
                prop.currentDate.month = (prop.currentDate.month > 10) ? 0 : prop.currentDate.month+1;
                if (!prop.currentDate.month) {
                    prop.currentDate.year = prop.currentDate.year+1;
                }
                displayCurrent.innerHTML = prop.local.month[prop.currentDate.month] + ' ' + prop.currentDate.year;
                _renderTable();                
            } else if (e.target.id === 'prev') {
                prop.currentDate.month = (!prop.currentDate.month) ? 11 : prop.currentDate.month-1;
                if (prop.currentDate.month == 11) {
                    prop.currentDate.year = prop.currentDate.year-1;
                }
                displayCurrent.innerHTML = prop.local.month[prop.currentDate.month] + ' ' + prop.currentDate.year;
                _renderTable();                
            } else if (e.target.id === 'today') {
                prop.currentDate = {
                    month: (new Date()).getMonth(),
                    year: (new Date()).getFullYear()
                };
                displayCurrent.innerHTML = prop.local.month[prop.currentDate.month] + ' ' + prop.currentDate.year;
                _renderTable();
            }
        }, false);        

        
        sidebar.addEventListener('keyup', function(e) {
            if (e.target.id == 'search') {
                var query = e.target.value.toLowerCase();
                var Ev = Events.map(function(data){
                    // TODO
                    // calendar.js:430 Uncaught TypeError: Cannot read property 'event' of null
                    if (data) {
                        return data.event + " " + 
                               data.date  + " " + 
                               data.names + " " + 
                               data.description + " | " +
                               (new Date(data.uid).getDate()) + " " + 
                               prop.local.monthList[(new Date(data.uid).getMonth())] +
                               " " + (new Date(data.uid).getFullYear());
                    }
                });

                var filterEvents = Ev.filter(function(e) {
                    if (e) {
                        return e.toLowerCase().indexOf(query) > -1;
                    }
                });
                
                
                if (query == "") {
                    searchResults.style.display = 'none';
                    searchResults.innerHTML = "";
                }else if (filterEvents.length>0) {
                    searchResults.style.display = 'block';
                    searchResults.innerHTML = filterEvents.join('<br/>') ;
                } else {
                    searchResults.style.display = 'none';
                    searchResults.innerHTML = "";
                }
            }
        }, false);
    }

    function _hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function _renderTable() {
        var container, div, title, table, tbody, tr, th, style;
        var months = [];
        var aDay;
        // создаем таблицу
        container = document.getElementById("calendar-table");
        container.innerHTML = '';
        div = _createElement('div',null,'td');
        container.appendChild(div);
        //div.innerHTML = "";
        
        table = _createElement('table');
        div.appendChild(table);
        tbody = _createElement('tbody');
        table.appendChild(tbody);
 
        // отрисовка таблицы
        // отсчет начинаем с первого календарного дня месяца
        var fDay = _getFirstDayMonth(prop.currentDate.year, prop.currentDate.month);
        var fDayTS = new Date(prop.currentDate.year, prop.currentDate.month,1,0,0,0,0).getTime();

        // вычисляем timestamp выпадающий на понедельник
        aDay = fDayTS - (prop.DAY*(fDay-1));

        for (var row = 0; row < prop.rowTotal; row++) {
            tr = _createElement('tr');
            tbody.appendChild(tr)
            for (var col = 0; col < 7; col++) {
                
                if (row == 0) {
                    //заполняем шапку календаря днями недели
                    var td = _createElement('td', prop.local.week[col] + ", " + (new Date(aDay)).getDate());
                } else {
                    // заполняем тело календаря
                    if (row == 1 && col == 0) {
                        months[0] = (new Date(aDay)).getMonth()+1; 
                    } else if (row == prop.rowTotal-1 && col == 6) {
                        months[1] = (new Date(aDay)).getMonth()+1;
                        if (months[0] == months[1]) {
                            months.pop();
                        // //console.log('last day', months);
                        }
                    }
                    td = _createElement('td', new Date(aDay).getDate());
                }
                if (aDay < Date.now()-prop.DAY) {
                    td.className = "last";
                } 
                //td.className = (col == 5 || col == 6) ? 'weekend' : '';

                Events.forEach(function(event) {
                    if (!!event && parseInt(event.uid) == aDay) {
                        td.className = "active";
                        if (aDay < Date.now()-prop.DAY) {
                            td.className = "last active";
                        } 
                        td.innerHTML += "<br/><b>" + event.event +
                            "</b><br/>" + event.date +
                            "<br/>"     + event.names +
                            "<br/>"     + event.description + "<br/>";
                    }
                });

                td.setAttribute('data-day', aDay);
                td.addEventListener("mousedown", function(e){
                    if (_isDialog()) {
                        return;
                    }
                    
                    // console.log(event.target.getAttribute('data-day'));


                    var el = e.target;
                    if (_hasClass(el,'active') || _hasClass(el,'last active')) {
                        // редактирование
                        el.className = "active edit";
                        var uid = parseInt(el.getAttribute('data-day'));
                        var data;
                        Events.forEach(function(event) {
                            if (event && event.uid == uid) {
                                data = event;
                            }

                        });
                        var wrap = _createElement('div', null, 'add-form-edit');
                        document.getElementById('calendar-table').appendChild(wrap);
                        wrap.style.left = this.offsetLeft + 130 + 'px';
                        wrap.style.top = this.offsetTop - 20 + 'px';

                        var close = _createElement('span','x', 'btnClose');
                        close.addEventListener('mousedown', function(e){
                            _dialogOff();
                            el.className = "active";
                            wrap.parentNode.removeChild(wrap);
                        }, false);
                        var btnClean = _createElement('button', 'очистить', 'btn-clean');
                        btnClean.addEventListener('mousedown', function(event) {
                            _dialogOff();
                            wrap.parentNode.removeChild(wrap);
                            //console.log('className удаляем, клетку очищаем и данные тоже сносим');
                            el.innerHTML = (new Date(data.uid)).getDate();
                            el.removeAttribute('class');
                            
                            Events.forEach(function(event,i) {
                                if (!!event && data.uid == event.uid) {
                                    delete Events[i];
                                }
                            });
                            localStorage.setItem('Events', JSON.stringify(Events));
                            
                        }, false);

                        // TODO Uncaught TypeError: Cannot read property 'event' of null
                        // at HTMLTableCellElement.<anonymous> (calendar.js:201)

                        var fieldEvent = _createElement('h3', data.event);
                        var fieldDate  = _createElement('p',  data.date);
                        var fieldName  = _createElement('p',  data.names);


                        var fieldDescription = _createElement('textarea', null, 'field-description');
                        fieldDescription.value = data.description;
                        
                        var btn = _createElement('button','готово','btn-add');
                        btn.addEventListener('mousedown', function(e) {
                            _dialogOff();
                            data.description = fieldDescription.value;
                            el.className = "active";
                            el.innerHTML = (new Date(uid)).getDate() + "<br/><b>" +
                                data.event +
                                "</b><br/>" + data.date +
                                "<br/>" + data.names +
                                "<br/>" + data.description + "<br/>";
                            Events.forEach(function(event,i) {
                                if (!!event && data.uid == event.uid) {
                                    Events[i] = data;
                                }
                            });
                            localStorage.setItem('Events', JSON.stringify(Events));
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

                        //???
                        if (_hasClass(el,'last')) {
                            _dialogOff();
                            // дата уже в прошлом
                            return;
                        }
                        // создание
                        var wrap = _createElement('div', null, 'add-form-advanced');
                        document.getElementById('calendar-table').appendChild(wrap);
                        wrap.style.left = this.offsetLeft + 130 + 'px';
                        wrap.style.top = this.offsetTop - 20 + 'px';

                        var close = _createElement('span', 'x', 'btnClose');
                        close.addEventListener('click', function(e){
                            _dialogOff();
                            wrap.parentNode.removeChild(wrap);
                        }, false);

                        var btnDone  = _createElement('button', 'Готово', 'btn-add');
                        var btnClean = _createElement('button', 'Очистить', 'btn-clean');
                        var fieldUID = _createElement('input');
                        fieldUID.setAttribute('type', 'hidden');
                        fieldUID.value = el.getAttribute('data-day');

                        var fieldEvent = _createElement('input', null, 'field-add');
                        fieldEvent.setAttribute('placeholder','Событие');
     
                        var fieldDate = _createElement('input', null, 'field-date');
                        fieldDate.setAttribute('placeholder', 'Время события');

                        var fieldName = _createElement('input', null, 'field-name');
                        fieldName.setAttribute('placeholder', 'Имена участников');

                        var fieldDescription = _createElement('textarea', null, 'field-description');
                        fieldDescription.setAttribute('placeholder', 'Описание');

                        btnDone.addEventListener('mousedown', function(e){
                            var data = {
                                uid: parseInt(fieldUID.value),
                                event: fieldEvent.value,
                                date: fieldDate.value,
                                names: fieldName.value,
                                description: fieldDescription.value
                            };
                            _dialogOff();
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
                        wrap.appendChild(btnDone);
                        wrap.appendChild(btnClean);
                    }
                }, false);
                tr.appendChild(td);
                aDay += prop.DAY;
            }
        }
    }
    function _init() {
        _initSidebar();
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








  