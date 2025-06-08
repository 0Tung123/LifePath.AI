import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CustomInputService } from './custom-input.service';
import { CustomInputDto, InputType } from './dto/custom-input.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('game/custom-input')
@UseGuards(JwtAuthGuard)
export class CustomInputController {
  constructor(private readonly customInputService: CustomInputService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async processCustomInput(@Body() customInputDto: CustomInputDto) {
    const { gameSessionId, type, content, target } = customInputDto;

    const updatedSession = await this.customInputService.processCustomInput(
      gameSessionId,
      type,
      content,
      target,
    );

    return {
      success: true,
      message: 'Custom input processed successfully',
      gameSession: updatedSession,
    };
  }

  @Get('input-types')
  getInputTypes() {
    return {
      inputTypes: [
        {
          type: InputType.ACTION,
          label: 'Hành động',
          placeholder: 'Nhập hành động bạn muốn thực hiện...',
          examples: [
            'Đi vào căn phòng tối',
            'Leo lên ngọn cây cao',
            'Rút kiếm ra',
          ],
        },
        {
          type: InputType.THOUGHT,
          label: 'Suy nghĩ',
          placeholder: 'Nhập suy nghĩ của nhân vật...',
          examples: [
            'Nơi này có vẻ nguy hiểm',
            'Liệu tôi có thể tin tưởng ông ta?',
          ],
        },
        {
          type: InputType.SPEECH,
          label: 'Nói chuyện',
          placeholder: 'Nhập lời nói của bạn...',
          examples: [
            'Tôi cần biết thêm về nhiệm vụ này',
            'Anh có thể giúp tôi không?',
          ],
        },
        {
          type: InputType.CUSTOM,
          label: 'Tùy chỉnh',
          placeholder: 'Nhập bất cứ điều gì...',
          examples: ['Tôi muốn kết hợp hành động và đối thoại'],
        },
      ],
    };
  }

  @Get('input-suggestions')
  async getInputSuggestions() {
    return {
      suggestions: {
        [InputType.ACTION]: [
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
        [InputType.THOUGHT]: [
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
        [InputType.SPEECH]: [
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
}
