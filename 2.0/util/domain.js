KISSY.add('KISSY.sns.domain', function(S) {

	var win = window,
		doc = document,
		Domain;

	/**
	 * @class 获取或设置 domain
	 * @memberOf SNS
	 * @author 释然
	 */

	Domain = {

		/**
		 * @lends SNS.Domain.prototype
		 */

		/**
		 * 获取 domain
		 * @param { Number } depth  可选参数，获取的深度，默认为 2.
		 * @param { String } host  可选参数，默认为当前 uri.
		 * @return { String }
		 */
		get: function(depth, host) {

			var hs = host || location.hostname,
				dp = depth || 2,
				parts = hs.split('.'),
				ret = [];

			while (parts.length && dp--) {

				ret.unshift(parts.pop());

			}

			return ret.join('.');

		},

		/**
		 * 设置当前 domain
		 * @param { Number | String } value  当前 uri 的深度或者要设置的 domain 字符串.
		 * @return { Object } Domain 
		 */
		set: function(value) {

			var that = this;

			doc.domain = S.isString(value) ? value : that.get(value);

			return that;

		}

	};

	S.namespace('KISSY.sns').domain = Domain;

});
