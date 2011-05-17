SNS('SNS.util.Storage', function(S, K) {

var D = K.DOM,
		Storage,
		EMPTY = '',
		SNS_STORAGE = 'sns';

	/**
	 * 本地存储，统一存储在 sns key 下
	 * @author 释然
	 * @example:
	 *
	 * 		SNS.Storage.setItem('jolin', '蔡依林');
	 * 		alert(SNS.Storage.getItem('jolin'));
	 * 		SNS.Storage.removeItem('jolin');
	 * 		alert(SNS.Storage.getItem('jolin'));
	 */
	Storage = {

		/**
		 * 读取本地存储
		 * @method getItem
		 * @param key { String }
		 */
		getItem: function(key) {

			return this._operateItem(key, 'get');

		},

		/**
		 * 写入本地存储
		 * @method setItem
		 * @param key { String }
		 * @param value { String }
		 */
		setItem: function(key, value) {

			return this._operateItem(key, 'set', value);

		},

		/**
		 * 移除本地存储
		 * @method removeItem
		 * @param key { String }
		 */
		removeItem: function(key) {

			return this._operateItem(key, 'remove');

		},

		/**
		 * 操作本地存储
		 * @method _operateItem
		 * @param key { String }
		 * @param type { String } add, set, remove
		 * @param value { String }
		 */
		_operateItem: function(key, type, value) {

			var that = this,
				ls,
				data;

			if('object' == typeof localStorage) {
				//ie8、ff3、opera、chrome、safari
				ls = localStorage;
			} else if('object' == typeof globalStorage) {
				//ff2
				ls = globalStorage(location.host);
			}

			if(ls) {

				data = that._strToObj(ls.getItem(SNS_STORAGE));

				if('get' === type) {

					return data[key];

				} else {

					data[key] = value;

					return ls[type + 'Item'](SNS_STORAGE, that._objToStr(data));

				}

			} else {

				//ie5、6、7

				var el = D.get('#J_StorageUserData');

				if(!el) {

					el = D.create('<input>', {
							id: 'J_StorageUserData',
							type: 'hidden',
							style: 'behavior:url(#default#userData)'
						 });

					document.body.appendChild(el);

				}

				if('set' === type) {

					try {

						el[type + 'Attribute'](key, value);

						el.save(SNS_STORAGE);

					} catch(e) {};

				} else {

					try {

						el.load(SNS_STORAGE);

						data = el[type + 'Attribute'](key);

						if('remove' !== type) {

							return data;

						}

						el.save(SNS_STORAGE);

					} catch(e) { return ''; };

				}

			}

		},

		/**
		 * 转换对象为字符串
		 * @method _objToStr
		 * @param obj { Object } json
		 * @private
		 */
		_objToStr: function(obj) {

			var str = EMPTY,
				i;

			for(i in obj) {

				str += ',' + i + ':' + obj[i];

			}

			return str.substr(1);

		},

		/**
		 * 转换字符串到对象
		 * @method _strToObj
		 * @param str { String }
		 * @private
		 */
		_strToObj: function(str) {

			return str ? K.JSON.parse('{"' + str.replace(/(:|,)/g, '"$1"') + '"}') : {};

		}

	};

	return S.util.Storage = Storage;

});
