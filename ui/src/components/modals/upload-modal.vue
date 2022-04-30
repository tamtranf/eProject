<template>
  <button type="button"
  @click="showModal()"
  :class="upload_btn_class">{{upload_btn_text}}</button>
  <div class="modal fade "
      ref="modalIDNew" id="staticBackdrop" data-bs-backdrop="static"
      data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-lg">
          <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">{{modal_title}}</h5>
                <button type="button" class="btn-close"
                @click="onClose('no')" aria-label="Close"></button>
              </div>
              <div class="modal-body" style="min-height: 300px;">
                <input
                  style="display: none;"
                  @change="fileSelected"
                  @click="fileClicked"
                  type="file"
                  name="upload_file"
                  id="upload_file"
                  data-cy="upload_file"
                  ref="upload_file"
                  accept="*/*"
                />
                <button
                  type="button"
                  class="btn btn-primary"
                  style="min-width:100px;width:300px;margin-top:5px;"
                  v-if="showChoseFile"
                  @click="choseFile"
                >ファイルを選択</button>
                <div v-if="uploading === true">
                  <br>
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <br>
                  アップロード中...
                </div>

                <div v-if="showUploadFile">
                  <label
                    v-if="this.selected_file_name != null && showUploadFile"
                  >{{this.selected_file_name}}</label>
                  <br />
                  <button
                    data-cy="upload_btn"
                    type="button"
                    style="min-width:200px;width: 10%;margin:15px;"
                    class="btn btn-primary"
                    @click="uploadFile({})"
                  >アップロード</button>
                  <button
                    type="button"
                    style="min-width:150px;width: 10%;margin:15px;background: #A6A6A6;border-color:#A6A6A6;"
                    class="btn btn-primary"
                    @click="cancelUpload"
                    v-if="showCancelUpload"
                  >キャンセル</button>
                </div>
                <div
                  v-if="errorMsg.length > 0"
                  style="margin: 30px;"
                  class="alert alert-danger"
                  v-html="errorMsg"
                ></div>
              </div>
          </div>
      </div>
  </div>
</template>
<script>
import mixinFormController from '@/mixins/form_controller';
import mixinLayoutComponents from '@/mixins/layout_components';
import acl from '@/mixins/acl';
import { Modal } from 'bootstrap';
import axios from 'axios';
// import constants from '../../../../api/rules/constants';
export default {
  name: 'upload-modal',
  data() {
    return {
      name: 'upload-modal',
      modalElem: null,
      title: 'Modal',
      count_error: 0,
      file_selected_event: false,
      selected_file_name: null,
      process_stage: 'idle',
      uploading: false,
      error_msg: '',
    };
  },

  mixins: [mixinLayoutComponents, mixinFormController, acl],
  components: { },
  computed: {
    errorMsg: {
      get() {
        return this.error_msg;
      },
      set(v) {
        this.error_msg = v;
      },
    },
    processStage: {
      get() {
        return this.process_stage;
      },
      set(v) {
        this.process_stage = v;
      },
    },
    showChoseFile() {
      return this.processStage === 'idle';
    },
    showUploadFile() {
      return this.processStage === 'file_selected';
    },
    showCancelUpload() {
      return this.processStage === 'file_selected';
    },
  },
  methods: {
    onClose() {
      this.cancelUpload();

      this.modalElem.hide();
    },
    showModal() {
      this.errorMsg = '';
      this.modalElem.show();
    },
    cancelUpload() {
      this.selected_file_name = null;
      this.file_selected_event = null;
      this.processStage = 'idle';
    },
    uploadFile(_options) {
      this.errorMsg = '';
      this.processStage = 'uploading';
      this.uploading = true;
      this.result_array = [];
      this.result_executed = false;
      const { files } = this.file_selected_event.target;
      if (!files[0]) {
        return;
      }
      const upload_data = new FormData();
      upload_data.append('upload', files[0]);
      // upload_data.append('entity_code', localStorage.getItem('entity_code'));
      console.log('upload_data', upload_data);
      axios
        .post(`${this.$ajax.serverUrl}${this.$props.api_url}`, upload_data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => {
          const { data } = response;
          console.log('Upload done', response, data);
          if (response.data.success === true) {
            this.uploading = false;

            this.processStage = 'idle';
            this.$notify({
              type: 'success',
              title: 'Uploaded',
              text: 'Uploaded with success',
            });
            this.$emit('uploaded', data);
            setTimeout(() => {
              this.onClose();
            }, 1000);
            return;
          }
          this.uploading = false;
          try {
            if (JSON.stringify(response.data.error) && JSON.stringify(response.data.error).indexOf('::') < 2) {
              this.errorMsg = `${JSON.stringify(response.data.error).replace('::', '').replace(/"/g, '')}`;
            } else {
              this.errorMsg = `エラー${JSON.stringify(response.data.error).replace(/"/g, '')}`;
            }
          } catch (error) {
            this.errorMsg = 'エラー ： Unexpected';
          }

          this.processStage = 'preview_error';
          this.file_selected_event = null;
          this.selected_file_name = null;
          this.uploading = false;
          this.count_error += 1;
          this.result_executed = true;
        })
        .catch((error) => {
          this.errorMsg = `エラー ：：： (${error})`;

          this.result_executed = true;
          console.log('upload File error:', error);
          this.count_error += 1;
          this.processStage = 'preview_error';
          this.result_error = `failed to upload: ${error}`;
          this.file_selected_event = null;
          this.selected_file_name = null;
          this.uploading = false;
        });
    },
    choseFile() {
      const { upload_file } = this.$refs;
      upload_file.click();
    },
    fileClicked(_e) {
      const { upload_file } = this.$refs;
      upload_file.value = null;
    },
    fileSelected(e) {
      const { files } = e.target;
      if (!files[0]) {
        return;
      }
      console.log('file_selected', files[0]);
      this.processStage = 'file_selected';
      this.file_selected_event = e;
      this.selected_file_name = files[0].name;
    },
  },
  props:
    {
      upload_btn_text: {
        type: String,
        default: 'Upload',
      },
      upload_btn_class: {
        type: String,
        default: 'btn btn-primary',
      },
      modal_title: {
        type: String,
        default: 'Upload',
      },
      api_url: {
        type: String,
        required: true,
      },
    },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.modalElem = new Modal(this.$refs.modalIDNew);
  },
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},
  unmounted() {},
  errorCaptured() {},
  renderTracked() {},
  renderTriggered() {},
  activated() {},
  deactivated() {},
};
</script>
<style scoped></style>
