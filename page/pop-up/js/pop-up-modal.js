// (function () {

		function getHtmlText(urlPath, cB, err){
			$.ajax({
				url : urlPath,
				type : "GET",
				dataType: "text",
				success : function (file) {
						cB($(file));
				},
				error : function (a, b, c) {
						if (typeof err === "function") {
								err(a, b, c);
						}
				}
			});
		}
		var srcPath = document.currentScript.src;
		function popupModule(filepath, done, data) {
			var urlPath = (srcPath).replace("js/pop-up-modal.js","base-modal.html"),
					popModal = $('<div id="pop-modal" class="pop-main"></div>'), exeFn = function () {};
					getHtmlText(urlPath, function (htOb1) {
							getHtmlText(filepath, function (htOb2) {
									htOb1.children(".pop-body .pop-content").append(htOb2);
									popModal.append(htOb1);
									$("body").append(popModal);
									$(".pop-close").on("click", function () {
											popModal.remove();
									})
									done(data, {
										close : function (pdata) {
												console.log("pdata", pdata);
												exeFn(pdata);
												popModal.remove();
										}, dismiss : function () {
												popModal.remove();
										}
									});
							}, function (e2) {
									console.log("e2",e2);
							})
					}, function (e1) {
						console.log("e1", e1);
					});

					function copyFn(fn) {
							exeFn = fn;
					}
					return {
						then : copyFn
					}
		}


// })()
