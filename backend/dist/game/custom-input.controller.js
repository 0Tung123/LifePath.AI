"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomInputController = void 0;
const common_1 = require("@nestjs/common");
const custom_input_service_1 = require("./custom-input.service");
const custom_input_dto_1 = require("./dto/custom-input.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CustomInputController = class CustomInputController {
    constructor(customInputService) {
        this.customInputService = customInputService;
    }
    async processCustomInput(customInputDto) {
        const { gameSessionId, type, content, target } = customInputDto;
        const updatedSession = await this.customInputService.processCustomInput(gameSessionId, type, content, target);
        return {
            success: true,
            message: 'Custom input processed successfully',
            gameSession: updatedSession,
        };
    }
    getInputTypes() {
        return {
            inputTypes: [
                {
                    type: custom_input_dto_1.InputType.ACTION,
                    label: 'Hành động',
                    placeholder: 'Nhập hành động bạn muốn thực hiện...',
                    examples: [
                        'Đi vào căn phòng tối',
                        'Leo lên ngọn cây cao',
                        'Rút kiếm ra',
                    ],
                },
                {
                    type: custom_input_dto_1.InputType.THOUGHT,
                    label: 'Suy nghĩ',
                    placeholder: 'Nhập suy nghĩ của nhân vật...',
                    examples: [
                        'Nơi này có vẻ nguy hiểm',
                        'Liệu tôi có thể tin tưởng ông ta?',
                    ],
                },
                {
                    type: custom_input_dto_1.InputType.SPEECH,
                    label: 'Nói chuyện',
                    placeholder: 'Nhập lời nói của bạn...',
                    examples: [
                        'Tôi cần biết thêm về nhiệm vụ này',
                        'Anh có thể giúp tôi không?',
                    ],
                },
                {
                    type: custom_input_dto_1.InputType.CUSTOM,
                    label: 'Tùy chỉnh',
                    placeholder: 'Nhập bất cứ điều gì...',
                    examples: ['Tôi muốn kết hợp hành động và đối thoại'],
                },
            ],
        };
    }
    async getInputSuggestions() {
        return {
            suggestions: {
                [custom_input_dto_1.InputType.ACTION]: [
                    'Khám xét khu vực xung quanh',
                    'Tìm kiếm manh mối',
                    'Rút vũ khí ra',
                    'Lẻn ra phía sau',
                    'Chạy trốn khỏi hiểm nguy',
                    'Sử dụng phép thuật',
                    'Trèo lên vị trí cao',
                    'Ẩn nấp trong bóng tối',
                    'Quan sát kẻ địch từ xa',
                    'Tạo bẫy đơn giản',
                ],
                [custom_input_dto_1.InputType.THOUGHT]: [
                    'Tôi nên tin tưởng người này không?',
                    'Có điều gì đó không ổn ở đây...',
                    'Đây có thể là cơ hội tốt',
                    'Mình cần thận trọng hơn',
                    'Nếu chỉ có thể cứu một người...',
                    'Quyết định này sẽ thay đổi mọi thứ',
                    'Liệu đây có phải là cạm bẫy?',
                    'Tôi cảm thấy có ai đó đang theo dõi',
                    'Những manh mối này không khớp nhau',
                    'Có lẽ tôi đã bỏ lỡ điều gì đó quan trọng',
                ],
                [custom_input_dto_1.InputType.SPEECH]: [
                    'Tôi cần biết thêm về nhiệm vụ này',
                    'Anh có thông tin gì về khu vực phía bắc không?',
                    'Chúng ta nên hợp tác với nhau',
                    'Tôi không tin lời nói của ngươi',
                    'Hãy kể cho tôi về quá khứ của bạn',
                    'Chúng ta không còn nhiều thời gian',
                    'Tôi có thể giúp gì cho bạn?',
                    'Đây là lời đề nghị cuối cùng của tôi',
                    'Tôi biết bí mật của bạn',
                    'Hãy thương lượng một thỏa thuận',
                ],
            },
        };
    }
};
exports.CustomInputController = CustomInputController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [custom_input_dto_1.CustomInputDto]),
    __metadata("design:returntype", Promise)
], CustomInputController.prototype, "processCustomInput", null);
__decorate([
    (0, common_1.Get)('input-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomInputController.prototype, "getInputTypes", null);
__decorate([
    (0, common_1.Get)('input-suggestions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomInputController.prototype, "getInputSuggestions", null);
exports.CustomInputController = CustomInputController = __decorate([
    (0, common_1.Controller)('game/custom-input'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [custom_input_service_1.CustomInputService])
], CustomInputController);
//# sourceMappingURL=custom-input.controller.js.map