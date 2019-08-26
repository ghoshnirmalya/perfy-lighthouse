require('dotenv').config()

const chromeLauncher = require('chrome-launcher')
const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse')
const request = require('request')
const util = require('util')
const fs = require('fs')
const { Pool } = require('pg')

const authenticateAndVisitURL = require('./lib/authenticate-and-visit-url')
const lighthouseConfig = require('./configs/lighthouse')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const generate = async (
  url,
  login_url,
  username_or_email_address_field_selector,
  username_or_email_address_field_value,
  password_field_selector,
  password_field_value,
  submit_button_selector
) => {
  /**
   * Default configs
   */
  const delay = 5000
  const loginURL = 'https://bulk.hulk.ehqstag.com/login'
  const opts = {
    chromeFlags: ['--headless', '--no-sandbox'],
    logLevel: 'info',
    output: 'json',
  }

  /**
   * Launch chrome using chrome-launcher.
   */
  const chrome = await chromeLauncher.launch(opts)

  opts.port = chrome.port

  /**
   * Connect to it using puppeteer.connect()
   */
  const resp = await util.promisify(request)(
    `http://localhost:${opts.port}/json/version`
  )
  const { webSocketDebuggerUrl } = JSON.parse(resp.body)
  let browser

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
    })
  } catch (error) {
    console.log(error)
  }

  let page

  try {
    page = await browser.newPage()
  } catch (error) {
    console.log(error)
  }

  page.on('error', error => {
    console.log('#########ERROR#########')
    console.log(`ERROR on link ${url.link}`)
    console.log(error)
    console.log('#########ERROR#########')
  })

  try {
    if (login_url) {
      /**
       * Perform authentication and visit the URL
       */
      await authenticateAndVisitURL(
        page,
        delay,
        url.link,
        login_url,
        username_or_email_address_field_selector,
        username_or_email_address_field_value,
        password_field_selector,
        password_field_value,
        submit_button_selector
      )
    }

    /**
     * Run Lighthouse
     */
    let results

    try {
      results = await lighthouse(url.link, opts, lighthouseConfig)
      ;(async () => {
        const client = await pool.connect()

        try {
          await client.query('BEGIN')
          await client.query(
            'INSERT INTO audit(fetch_time, requested_url, final_url, url_id, audit_is_on_https_score, audit_redirects_http_score, audit_service_worker_score, audit_works_offline_score, audit_without_javascript_score, audit_viewport_score, audit_first_contentful_paint_score, audit_first_contentful_paint_display_value, audit_first_meaningful_paint_score, audit_first_meaningful_paint_display_value, audit_load_fast_enough_for_pwa_score, audit_load_fast_enough_for_pwa_display_value, audit_speed_index_score, audit_speed_index_display_value, audit_screenshot_thumbnails, audit_final_screenshot, audit_estimated_input_latency_score, audit_estimated_input_latency_display_value, audit_total_blocking_time_score, audit_total_blocking_time_display_value, audit_max_potential_fid_score, audit_max_potential_fid_display_value, audit_time_to_first_byte_display_value, audit_first_cpu_idle_display_value, audit_interactive_score, audit_installable_manifest_score, audit_mainthread_work_breakdown_score, audit_mainthread_work_breakdown_display_value, audit_mainthread_work_breakdown_display_details, audit_bootup_time_score, audit_bootup_time_display_value, audit_bootup_time_display_details, audit_diagnostics_details, audit_network_requests_details, audit_network_server_latency_details, audit_resource_summary_details, audit_third_party_summary_details, audit_uses_long_cache_ttl_details, audit_total_byte_weight_details, audit_aria_allowed_attr_details, audit_aria_required_attr_details, audit_aria_required_children_details, audit_aria_required_parent_details, audit_aria_roles_details, audit_aria_valid_attr_value_details, audit_aria_valid_attr_details, audit_button_name_details, audit_bypass_details, audit_color_contrast_details, audit_definition_list_details, audit_dlitem_details, audit_document_title_details, audit_duplicate_id_details, audit_frame_title_details, audit_html_has_lang_details, audit_html_lang_valid_details, audit_image_alt_details, audit_input_image_alt_details, audit_label_details, audit_layout_table_details, audit_link_name_details, audit_list_details, audit_listitem_details, audit_meta_refresh_details, audit_meta_viewport_details, audit_object_alt_details, audit_tabindex_details, audit_td_headers_attr_details, audit_th_has_data_cells_details, audit_offscreen_images_details, audit_render_blocking_resources_details, audit_render_blocking_resources_display_value, audit_unminified_css_details, audit_unminified_css_overall_savings_ms, audit_unminified_css_overall_savings_bytes, audit_unminified_javascript_details, audit_unminified_javascript_overall_savings_ms, audit_unminified_javascript_overall_savings_bytes, audit_unused_css_rules_details, audit_unused_css_rules_overall_savings_ms, audit_unused_css_rules_overall_savings_bytes, audit_uses_webp_images_details, audit_uses_webp_images_overall_savings_ms, audit_uses_webp_images_overall_savings_bytes, audit_uses_webp_images_display_value, audit_uses_optimized_images_details, audit_uses_optimized_images_overall_savings_ms, audit_uses_optimized_images_overall_savings_bytes, audit_uses_optimized_images_display_value, audit_uses_text_compression_details, audit_uses_text_compression_overall_savings_ms, audit_uses_text_compression_overall_savings_bytes, audit_uses_text_compression_display_value, audit_uses_responsive_images_details, audit_uses_responsive_images_overall_savings_ms, audit_uses_responsive_images_overall_savings_bytes, audit_uses_responsive_images_display_value, audit_js_libraries_details, audit_uses_http2_details, config_settings_emulated_form_factor, categories_performance_score, categories_accessibility_score, categories_best_practices_score, categories_seo_score, categories_pwa_score) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98, $99, $100, $101, $102, $103, $104, $105, $106, $107, $108, $109) RETURNING id',
            [
              results.lhr.fetchTime,
              results.lhr.requestedUrl,
              results.lhr.finalUrl,
              url.id,
              results.lhr.audits['is-on-https'].score,
              results.lhr.audits['redirects-http'].score,
              results.lhr.audits['service-worker'].score,
              results.lhr.audits['works-offline'].score,
              results.lhr.audits['viewport'].score,
              results.lhr.audits['without-javascript'].score,
              results.lhr.audits['first-meaningful-paint'].score,
              results.lhr.audits['first-meaningful-paint'].displayValue,
              results.lhr.audits['first-contentful-paint'].score,
              results.lhr.audits['first-contentful-paint'].displayValue,
              results.lhr.audits['load-fast-enough-for-pwa'].score,
              results.lhr.audits['load-fast-enough-for-pwa'].displayValue,
              results.lhr.audits['speed-index'].score,
              results.lhr.audits['speed-index'].displayValue,
              results.lhr.audits['screenshot-thumbnails'].details,
              results.lhr.audits['final-screenshot'].details,
              results.lhr.audits['estimated-input-latency'].score,
              results.lhr.audits['estimated-input-latency'].displayValue,
              results.lhr.audits['total-blocking-time'].score,
              results.lhr.audits['total-blocking-time'].displayValue,
              results.lhr.audits['max-potential-fid'].score,
              results.lhr.audits['max-potential-fid'].displayValue,
              results.lhr.audits['time-to-first-byte'].displayValue,
              results.lhr.audits['first-cpu-idle'].displayValue,
              results.lhr.audits['interactive'].score,
              results.lhr.audits['installable-manifest'].score,
              results.lhr.audits['mainthread-work-breakdown'].score,
              results.lhr.audits['mainthread-work-breakdown'].displayValue,
              results.lhr.audits['mainthread-work-breakdown'].details,
              results.lhr.audits['bootup-time'].score,
              results.lhr.audits['bootup-time'].displayValue,
              results.lhr.audits['bootup-time'].details,
              results.lhr.audits['diagnostics'].details,
              results.lhr.audits['network-requests'].details,
              results.lhr.audits['network-server-latency'].details,
              results.lhr.audits['resource-summary'].details,
              results.lhr.audits['third-party-summary'].details,
              results.lhr.audits['uses-long-cache-ttl'].details,
              results.lhr.audits['total-byte-weight'].details,
              results.lhr.audits['aria-allowed-attr'].details,
              results.lhr.audits['aria-required-attr'].details,
              results.lhr.audits['aria-required-children'].details,
              results.lhr.audits['aria-required-parent'].details,
              results.lhr.audits['aria-roles'].details,
              results.lhr.audits['aria-valid-attr-value'].details,
              results.lhr.audits['aria-valid-attr'].details,
              results.lhr.audits['button-name'].details,
              results.lhr.audits['bypass'].details,
              results.lhr.audits['color-contrast'].details,
              results.lhr.audits['definition-list'].details,
              results.lhr.audits['dlitem'].details,
              results.lhr.audits['document-title'].details,
              results.lhr.audits['duplicate-id'].details,
              results.lhr.audits['frame-title'].details,
              results.lhr.audits['html-has-lang'].details,
              results.lhr.audits['html-lang-valid'].details,
              results.lhr.audits['image-alt'].details,
              results.lhr.audits['input-image-alt'].details,
              results.lhr.audits['label'].details,
              results.lhr.audits['layout-table'].details,
              results.lhr.audits['link-name'].details,
              results.lhr.audits['list'].details,
              results.lhr.audits['listitem'].details,
              results.lhr.audits['meta-refresh'].details,
              results.lhr.audits['meta-viewport'].details,
              results.lhr.audits['object-alt'].details,
              results.lhr.audits['tabindex'].details,
              results.lhr.audits['td-headers-attr'].details,
              results.lhr.audits['th-has-data-cells'].details,
              results.lhr.audits['offscreen-images'].details,
              results.lhr.audits['render-blocking-resources'].details,
              results.lhr.audits['render-blocking-resources'].displayValue,
              results.lhr.audits['unminified-css'].details,
              results.lhr.audits['unminified-css'].overallSavingsMs,
              results.lhr.audits['unminified-css'].overallSavingsBytes,
              results.lhr.audits['unminified-javascript'].details,
              results.lhr.audits['unminified-javascript'].overallSavingsMs,
              results.lhr.audits['unminified-javascript'].overallSavingsBytes,
              results.lhr.audits['unused-css-rules'].details,
              results.lhr.audits['unused-css-rules'].overallSavingsMs,
              results.lhr.audits['unused-css-rules'].overallSavingsBytes,
              results.lhr.audits['uses-webp-images'].details,
              results.lhr.audits['uses-webp-images'].overallSavingsMs,
              results.lhr.audits['uses-webp-images'].overallSavingsBytes,
              results.lhr.audits['uses-webp-images'].displayValue,
              results.lhr.audits['uses-optimized-images'].details,
              results.lhr.audits['uses-optimized-images'].overallSavingsMs,
              results.lhr.audits['uses-optimized-images'].overallSavingsBytes,
              results.lhr.audits['uses-optimized-images'].displayValue,
              results.lhr.audits['uses-text-compression'].details,
              results.lhr.audits['uses-text-compression'].overallSavingsMs,
              results.lhr.audits['uses-text-compression'].overallSavingsBytes,
              results.lhr.audits['uses-text-compression'].displayValue,
              results.lhr.audits['uses-responsive-images'].details,
              results.lhr.audits['uses-responsive-images'].overallSavingsMs,
              results.lhr.audits['uses-responsive-images'].overallSavingsBytes,
              results.lhr.audits['uses-responsive-images'].displayValue,
              results.lhr.audits['js-libraries'].details,
              results.lhr.audits['uses-http2'].details,
              results.lhr.configSettings.emulatedFormFactor,
              results.lhr.categories.performance.score,
              results.lhr.categories.accessibility.score,
              results.lhr.categories['best-practices'].score,
              results.lhr.categories.seo.score,
              results.lhr.categories.pwa.score,
            ]
          )

          await client.query('COMMIT')

          await client.release()
        } catch (e) {
          await client.query('ROLLBACK')

          throw e
        }
      })().catch(e => console.error(e.stack))
      // await browser.disconnect()
      await browser.close()
      await chrome.kill()
    } catch (error) {
      // await browser.disconnect()
      await browser.close()
      await chrome.kill()
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = generate
